package com.g9latam.team14.debt.domain.ports.outbound;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import java.util.List;
import java.util.Optional;
public interface DebtRepositoryPort {
    Debt save(Debt debt);
    List<Debt> saveAll(List<Debt> debts);
    List<Debt> findByUserId(Integer userId);
    List<Debt> findByUserIdAndStatus(Integer userId, DebtStatus status);
    Optional<Debt> findById(Integer id);
    void deleteById(Integer id);
}
