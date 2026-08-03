package com.g9latam.team14.debt.domain.ports.inbound;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import java.util.List;
import java.util.Optional;
public interface GetDebtsUseCase {
    List<Debt> getDebtsByUserIdAndStatus(Integer userId, DebtStatus status);
    List<Debt> getAllDebtsByUserId(Integer userId);
    Optional<Debt> getDebtById(Integer id);
}
