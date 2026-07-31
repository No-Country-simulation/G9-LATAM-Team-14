package com.g9latam.team14.debt.domain.ports.inbound;
import com.g9latam.team14.debt.domain.model.Debt;
public interface UpdateDebtUseCase {
    Debt updateDebt(Integer id, Debt debt);
}
