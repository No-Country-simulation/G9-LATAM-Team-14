package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.ports.inbound.UpdateDebtUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

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
                    if (debt.getUserId() == null) {
                        debt.setUserId(existing.getUserId());
                    }
                    if (debt.getStatus() == null) {
                        debt.setStatus(existing.getStatus());
                    }
                    if (debt.getPaidInstallments() == null) {
                        debt.setPaidInstallments(existing.getPaidInstallments());
                    }
                    return debtRepository.save(debt);
                })
                .orElseThrow(() -> new IllegalArgumentException("Debt with ID " + id + " not found"));
    }
}
