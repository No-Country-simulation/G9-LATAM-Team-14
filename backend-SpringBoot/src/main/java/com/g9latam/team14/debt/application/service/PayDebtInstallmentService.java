package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.PayDebtInstallmentUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import com.g9latam.team14.debt.domain.service.DebtFinancialCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PayDebtInstallmentService implements PayDebtInstallmentUseCase {
    private final DebtRepositoryPort debtRepository;

    @Override
    @CacheEvict(value = {"debtSummary", "debtProjection"}, allEntries = true)
    public Debt payInstallment(Integer id) {
        Debt debt = debtRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Debt with ID " + id + " not found"));
        DebtFinancialCalculator.ensureDefaults(debt);
        int paid = debt.getPaidInstallments() != null ? debt.getPaidInstallments() : 0;
        int total = debt.getMonthsTerm() != null ? debt.getMonthsTerm() : 12;
        paid++;
        debt.setPaidInstallments(paid);
        BigDecimal payment = debt.getMonthlyAmount() != null ? debt.getMonthlyAmount() : BigDecimal.ZERO;
        debt.setOutstandingBalance(debt.getOutstandingBalance().subtract(payment).max(BigDecimal.ZERO));
        if (paid >= total || debt.getOutstandingBalance().compareTo(BigDecimal.ZERO) == 0) {
            debt.setStatus(DebtStatus.PAID);
        }
        return debtRepository.save(debt);
    }
}
