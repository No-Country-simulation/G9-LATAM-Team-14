package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.PayDebtInstallmentUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PayDebtInstallmentService implements PayDebtInstallmentUseCase {
    private final DebtRepositoryPort debtRepository;

    @Override
    @CacheEvict(value = {"debtSummary", "debtProjection"}, allEntries = true)
    public Debt payInstallment(Integer id) {
        Debt debt = debtRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Debt with ID " + id + " not found"));
        int paid = debt.getPaidInstallments() != null ? debt.getPaidInstallments() : 0;
        int total = debt.getMonthsTerm() != null ? debt.getMonthsTerm() : 12;
        paid++;
        debt.setPaidInstallments(paid);
        if (paid >= total) {
            debt.setStatus(DebtStatus.PAID);
        }
        return debtRepository.save(debt);
    }
}
