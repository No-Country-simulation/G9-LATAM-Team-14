package com.g9latam.team14.debt.application.service;

import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserJpaRepository;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.model.DebtSummary;
import com.g9latam.team14.debt.domain.ports.inbound.GetDebtSummaryUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GetDebtSummaryService implements GetDebtSummaryUseCase {
    private final DebtRepositoryPort debtRepository;
    private final UserJpaRepository userJpaRepository;

    @Override
    @Cacheable(value = "debtSummary", key = "#userId")
    public DebtSummary getDebtSummaryByUserId(Integer userId) {
        List<Debt> activeDebts = debtRepository.findByUserIdAndStatus(userId, DebtStatus.ACTIVE);
        BigDecimal totalPending = BigDecimal.ZERO;
        BigDecimal monthlyTotal = BigDecimal.ZERO;
        int maxMonthsRemaining = 0;
        for (Debt debt : activeDebts) {
            BigDecimal monthly = debt.getMonthlyAmount() != null ? debt.getMonthlyAmount() : BigDecimal.ZERO;
            monthlyTotal = monthlyTotal.add(monthly);
            int monthsTerm = debt.getMonthsTerm() != null ? debt.getMonthsTerm() : 12;
            int paid = debt.getPaidInstallments() != null ? debt.getPaidInstallments() : 0;
            int remainingMonths = Math.max(0, monthsTerm - paid);
            if (remainingMonths > maxMonthsRemaining) {
                maxMonthsRemaining = remainingMonths;
            }
            BigDecimal pending;
            if (debt.getTotalAmount() != null) {
                BigDecimal paidAmount = monthly.multiply(BigDecimal.valueOf(paid));
                pending = debt.getTotalAmount().subtract(paidAmount).max(BigDecimal.ZERO);
            } else {
                pending = monthly.multiply(BigDecimal.valueOf(remainingMonths));
            }
            totalPending = totalPending.add(pending);
        }

        UserEntity user = userJpaRepository.findById(userId).orElse(null);
        BigDecimal estimatedIncome = (user != null && user.getIngresoMensual() != null && user.getIngresoMensual() > 0)
                ? BigDecimal.valueOf(user.getIngresoMensual())
                : new BigDecimal("5000.00");

        double incomePercentage = estimatedIncome.compareTo(BigDecimal.ZERO) > 0
                ? monthlyTotal.divide(estimatedIncome, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .doubleValue()
                : 0.0;

        LocalDate freeDate = LocalDate.now().plusMonths(maxMonthsRemaining);
        String formattedFreeDate = freeDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));
        return DebtSummary.builder()
                .totalPendingAmount(totalPending)
                .totalMonthlyPayment(monthlyTotal)
                .incomePercentage(incomePercentage)
                .estimatedFreeDate(formattedFreeDate)
                .monthsRemaining(maxMonthsRemaining)
                .build();
    }
}
