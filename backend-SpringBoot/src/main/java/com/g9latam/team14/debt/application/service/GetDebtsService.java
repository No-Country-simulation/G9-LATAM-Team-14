package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.GetDebtsUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GetDebtsService implements GetDebtsUseCase {
    private final DebtRepositoryPort debtRepository;

    @Override
    public List<Debt> getDebtsByUserIdAndStatus(Integer userId, DebtStatus status) {
        if (status == null) {
            return debtRepository.findByUserId(userId);
        }
        return debtRepository.findByUserIdAndStatus(userId, status);
    }

    @Override
    public List<Debt> getAllDebtsByUserId(Integer userId) {
        return debtRepository.findByUserId(userId);
    }

    @Override
    public Optional<Debt> getDebtById(Integer id) {
        return debtRepository.findById(id);
    }
}
