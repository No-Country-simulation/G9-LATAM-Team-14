package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.ports.inbound.UpdateDebtUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import com.g9latam.team14.debt.domain.service.DebtFinancialCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class UpdateDebtService implements UpdateDebtUseCase {
    private final DebtRepositoryPort debtRepository;

    @Override
    @CacheEvict(value = {"debtSummary", "debtProjection"}, allEntries = true)
    public Debt updateDebt(Integer id, Debt debt) {
        return debtRepository.findById(id)
                .map(existing -> {
                    debt.setId(existing.getId());
                    BigDecimal previousTotal = existing.getTotalAmount() != null
                            ? existing.getTotalAmount()
                            : BigDecimal.ZERO;
                    DebtFinancialCalculator.ensureDefaults(existing);
                    BigDecimal alreadyPaid = previousTotal.subtract(existing.getOutstandingBalance())
                            .max(BigDecimal.ZERO);
                    if (debt.getUserId() == null) {
                        debt.setUserId(existing.getUserId());
                    }
                    if (debt.getStatus() == null) {
                        debt.setStatus(existing.getStatus());
                    }
                    if (debt.getPaidInstallments() == null) {
                        debt.setPaidInstallments(existing.getPaidInstallments());
                    }
                    if (debt.getCategory() == null || debt.getCategory().isBlank()) {
                        debt.setCategory(existing.getCategory());
                    }
                    if (debt.getTotalAmount() == null) {
                        debt.setTotalAmount(existing.getTotalAmount());
                    }
                    if (debt.getMonthsTerm() == null) {
                        debt.setMonthsTerm(existing.getMonthsTerm());
                    }
                    if (debt.getStartDate() == null) {
                        debt.setStartDate(existing.getStartDate());
                    }
                    if (debt.getEndDate() == null) {
                        debt.setEndDate(existing.getEndDate());
                    }
                    if (debt.getPaymentMode() == null) {
                        debt.setPaymentMode(existing.getPaymentMode());
                    }
                    if (debt.getIsIndefinite() == null) {
                        debt.setIsIndefinite(existing.getIsIndefinite());
                    }
                    debt.setAnnualEffectiveRate(DebtFinancialCalculator.annualEffectiveRateFor(debt.getCategory()));
                    debt.setOutstandingBalance(debt.getTotalAmount().subtract(alreadyPaid).max(BigDecimal.ZERO));
                    debt.setMonthlyAmount(DebtFinancialCalculator.monthlyPayment(
                            debt.getTotalAmount(),
                            debt.getMonthsTerm(),
                            debt.getAnnualEffectiveRate()
                    ));
                    return debtRepository.save(debt);
                })
                .orElseThrow(() -> new IllegalArgumentException("Debt with ID " + id + " not found"));
    }
}
