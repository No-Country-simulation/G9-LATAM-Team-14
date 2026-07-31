package com.g9latam.team14.debt.domain.ports.inbound;
import com.g9latam.team14.debt.domain.model.Debt;
import java.util.List;
public interface CreateBatchDebtsUseCase {
    List<Debt> createBatchDebts(List<Debt> debts, Integer userId);
}
