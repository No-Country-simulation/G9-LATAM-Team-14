package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.ports.inbound.DeleteDebtUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteDebtService implements DeleteDebtUseCase {
    private final DebtRepositoryPort debtRepository;

    @Override
    @CacheEvict(value = {"debtSummary", "debtProjection"}, allEntries = true)
    public void deleteDebt(Integer id) {
        debtRepository.deleteById(id);
    }
}
