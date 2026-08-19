package com.g9latam.team14.debt.application.service;

import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.ApplyDebtPaymentUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import com.g9latam.team14.debt.domain.service.DebtFinancialCalculator;
import com.g9latam.team14.shared.infrastructure.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ApplyDebtPaymentService implements ApplyDebtPaymentUseCase {
    private static final double MINIMUM_SIMILARITY = 0.50;
    private static final double AMBIGUITY_MARGIN = 0.05;
    private static final Set<String> GENERIC_WORDS = Set.of(
            "abono", "credito", "cuota", "de", "deuda", "financiacion", "la", "pago", "prestamo"
    );

    private final DebtRepositoryPort debtRepository;

    @Override
    @CacheEvict(value = {"debtSummary", "debtProjection", "dashboardSummary"}, allEntries = true)
    public Debt applyPayment(Integer userId, BigDecimal amount, String description, Integer requestedDebtId) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("El pago de la deuda debe ser mayor que cero.", HttpStatus.BAD_REQUEST);
        }

        Debt debt = requestedDebtId != null
                ? findRequestedDebt(userId, requestedDebtId)
                : findMatchingDebt(userId, description);

        DebtFinancialCalculator.ensureDefaults(debt);
        BigDecimal allocatedAmount = amount.min(debt.getOutstandingBalance());
        debt.setOutstandingBalance(debt.getOutstandingBalance()
                .subtract(allocatedAmount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP));
        updateProgress(debt);
        return debtRepository.save(debt);
    }

    @Override
    @CacheEvict(value = {"debtSummary", "debtProjection", "dashboardSummary"}, allEntries = true)
    public void reversePayment(Integer userId, Integer debtId, BigDecimal amount) {
        if (debtId == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        Debt debt = findRequestedDebt(userId, debtId, false);
        DebtFinancialCalculator.ensureDefaults(debt);
        BigDecimal original = debt.getTotalAmount() != null ? debt.getTotalAmount() : BigDecimal.ZERO;
        debt.setOutstandingBalance(debt.getOutstandingBalance().add(amount).min(original));
        updateProgress(debt);
        debtRepository.save(debt);
    }

    @Override
    public boolean paymentMatchesDebt(Integer userId, Integer debtId, String description) {
        if (debtId == null) {
            return false;
        }
        Debt debt;
        try {
            debt = findRequestedDebt(userId, debtId, false);
        } catch (RuntimeException exception) {
            return false;
        }
        return similarity(DebtFinancialCalculator.normalize(description), debt.getCategory()) >= MINIMUM_SIMILARITY;
    }

    private Debt findRequestedDebt(Integer userId, Integer debtId) {
        return findRequestedDebt(userId, debtId, true);
    }

    private Debt findRequestedDebt(Integer userId, Integer debtId, boolean requireActive) {
        Debt debt = debtRepository.findById(debtId)
                .orElseThrow(() -> new CustomException("La deuda seleccionada no existe.", HttpStatus.BAD_REQUEST));
        if (userId == null || !userId.equals(debt.getUserId())) {
            throw new CustomException("La deuda seleccionada no pertenece al usuario autenticado.", HttpStatus.FORBIDDEN);
        }
        if (requireActive && debt.getStatus() != DebtStatus.ACTIVE) {
            throw new CustomException("La deuda seleccionada ya no está activa.", HttpStatus.BAD_REQUEST);
        }
        return debt;
    }

    private Debt findMatchingDebt(Integer userId, String description) {
        List<Debt> activeDebts = debtRepository.findByUserIdAndStatus(userId, DebtStatus.ACTIVE);
        if (activeDebts.isEmpty()) {
            throw new CustomException("No hay una deuda activa a la cual aplicar este pago.", HttpStatus.BAD_REQUEST);
        }

        String normalizedDescription = DebtFinancialCalculator.normalize(description);
        List<ScoredDebt> scoredDebts = new ArrayList<>();
        for (Debt debt : activeDebts) {
            scoredDebts.add(new ScoredDebt(debt, similarity(normalizedDescription, debt.getCategory())));
        }
        scoredDebts.sort((left, right) -> Double.compare(right.score(), left.score()));

        ScoredDebt best = scoredDebts.getFirst();
        if (best.score() < MINIMUM_SIMILARITY) {
            throw new CustomException(
                    "No fue posible identificar a cuál deuda corresponde el pago. Incluya el tipo de crédito en la descripción.",
                    HttpStatus.BAD_REQUEST
            );
        }
        if (scoredDebts.size() > 1 && best.score() - scoredDebts.get(1).score() < AMBIGUITY_MARGIN) {
            throw new CustomException(
                    "El pago coincide con más de una deuda. Indique si corresponde a tarjeta, educación, vivienda, vehículo o crédito personal.",
                    HttpStatus.BAD_REQUEST
            );
        }
        return best.debt();
    }

    private double similarity(String normalizedDescription, String category) {
        Set<String> descriptionTokens = significantTokens(normalizedDescription);
        Set<String> categoryTokens = significantTokens(DebtFinancialCalculator.normalize(category));
        if (descriptionTokens.isEmpty() || categoryTokens.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(descriptionTokens);
        intersection.retainAll(categoryTokens);
        Set<String> union = new HashSet<>(descriptionTokens);
        union.addAll(categoryTokens);
        double categoryCoverage = (double) intersection.size() / categoryTokens.size();
        double jaccard = (double) intersection.size() / union.size();
        return 0.70 * categoryCoverage + 0.30 * jaccard;
    }

    private Set<String> significantTokens(String normalizedText) {
        Set<String> tokens = new HashSet<>(Arrays.asList(normalizedText.split("\\s+")));
        tokens.removeIf(token -> token.isBlank() || GENERIC_WORDS.contains(token));
        return tokens;
    }

    private void updateProgress(Debt debt) {
        BigDecimal original = debt.getTotalAmount() != null ? debt.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal paid = original.subtract(debt.getOutstandingBalance()).max(BigDecimal.ZERO);
        BigDecimal monthly = debt.getMonthlyAmount() != null ? debt.getMonthlyAmount() : BigDecimal.ZERO;
        int paidInstallments = monthly.compareTo(BigDecimal.ZERO) > 0
                ? paid.divide(monthly, 0, RoundingMode.FLOOR).intValue()
                : 0;
        if (debt.getMonthsTerm() != null) {
            paidInstallments = Math.min(paidInstallments, debt.getMonthsTerm());
        }
        debt.setPaidInstallments(paidInstallments);
        debt.setStatus(debt.getOutstandingBalance().compareTo(BigDecimal.ZERO) == 0
                ? DebtStatus.PAID
                : DebtStatus.ACTIVE);
    }

    private record ScoredDebt(Debt debt, double score) {
    }
}
