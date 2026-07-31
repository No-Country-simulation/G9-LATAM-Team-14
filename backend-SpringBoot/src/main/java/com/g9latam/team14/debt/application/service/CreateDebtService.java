package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.CreateDebtUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateDebtService implements CreateDebtUseCase {
    private final DebtRepositoryPort debtRepository;
    
    @Override
    public Debt createDebt(Debt debt) {
        if (debt.getStatus() == null) {
            debt.setStatus(DebtStatus.ACTIVE);
        }
        if (debt.getPaidInstallments() == null) {
            debt.setPaidInstallments(0);
        }
        return debtRepository.save(debt);
    }
}
