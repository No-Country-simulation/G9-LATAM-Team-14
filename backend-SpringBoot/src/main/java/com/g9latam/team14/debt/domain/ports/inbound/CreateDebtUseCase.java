package com.g9latam.team14.debt.domain.ports.inbound;
import com.g9latam.team14.debt.domain.model.Debt;
public interface CreateDebtUseCase {
    Debt createDebt(Debt debt);
}
