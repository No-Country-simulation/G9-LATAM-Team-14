package com.g9latam.team14.debt.domain.ports.inbound;
import com.g9latam.team14.debt.domain.model.DebtSummary;
public interface GetDebtSummaryUseCase {
    DebtSummary getDebtSummaryByUserId(Integer userId);
}
