package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.CreateBatchDebtsUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CreateBatchDebtsService implements CreateBatchDebtsUseCase {
    private final DebtRepositoryPort debtRepository;

    @Override
    public List<Debt> createBatchDebts(List<Debt> debts, Integer userId) {
        debts.forEach(debt -> {
            debt.setUserId(userId);
            if (debt.getStatus() == null) {
                debt.setStatus(DebtStatus.ACTIVE);
            }
            if (debt.getPaidInstallments() == null) {
                debt.setPaidInstallments(0);
            }
        });
        return debtRepository.saveAll(debts);
    }
}
