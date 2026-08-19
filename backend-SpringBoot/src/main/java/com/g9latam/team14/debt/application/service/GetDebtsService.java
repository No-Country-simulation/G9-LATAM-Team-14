package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtMonthlyPaymentStatus;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.GetDebtsUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import com.g9latam.team14.debt.domain.service.DebtFinancialCalculator;
import com.g9latam.team14.movement.domain.ports.outbound.MovementRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GetDebtsService implements GetDebtsUseCase {
    private final DebtRepositoryPort debtRepository;
    private final MovementRepositoryPort movementRepository;

    @Override
    public List<Debt> getDebtsByUserIdAndStatus(Integer userId, DebtStatus status) {
        List<Debt> debts = status == null
                ? debtRepository.findByUserId(userId)
                : debtRepository.findByUserIdAndStatus(userId, status);
        return normalizeLegacyDebts(debts);
    }

    @Override
    public List<Debt> getAllDebtsByUserId(Integer userId) {
        return normalizeLegacyDebts(debtRepository.findByUserId(userId));
    }

    @Override
    public Optional<Debt> getDebtById(Integer id) {
        return debtRepository.findById(id).map(this::normalizeLegacyDebt);
    }

    private List<Debt> normalizeLegacyDebts(List<Debt> debts) {
        return debts.stream().map(this::normalizeLegacyDebt).toList();
    }

    private Debt normalizeLegacyDebt(Debt debt) {
        boolean requiresUpdate = debt.getAnnualEffectiveRate() == null || debt.getOutstandingBalance() == null;
        DebtFinancialCalculator.ensureDefaults(debt);
        Debt normalizedDebt = requiresUpdate ? debtRepository.save(debt) : debt;
        return addMonthlyPaymentStatus(normalizedDebt);
    }

    private Debt addMonthlyPaymentStatus(Debt debt) {
        BigDecimal paidThisMonth = debt.getId() == null
                ? BigDecimal.ZERO
                : movementRepository.sumAppliedDebtPaymentsByDebtIdAndMonth(
                        debt.getId(),
                        YearMonth.now().toString()
                );
        if (paidThisMonth == null) {
            paidThisMonth = BigDecimal.ZERO;
        }

        BigDecimal monthlyAmount = debt.getMonthlyAmount() == null
                ? BigDecimal.ZERO
                : debt.getMonthlyAmount();

        DebtMonthlyPaymentStatus paymentStatus;
        if (monthlyAmount.signum() > 0 && paidThisMonth.compareTo(monthlyAmount) >= 0) {
            paymentStatus = DebtMonthlyPaymentStatus.PAID;
        } else if (paidThisMonth.signum() > 0) {
            paymentStatus = DebtMonthlyPaymentStatus.PARTIAL;
        } else {
            paymentStatus = DebtMonthlyPaymentStatus.PENDING;
        }

        debt.setPaidAmountThisMonth(paidThisMonth);
        debt.setMonthlyPaymentStatus(paymentStatus);
        return debt;
    }
}
