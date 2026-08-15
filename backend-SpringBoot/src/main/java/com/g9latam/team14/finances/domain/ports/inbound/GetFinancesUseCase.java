package com.g9latam.team14.finances.domain.ports.inbound;
import com.g9latam.team14.finances.domain.model.FinancesData;
public interface GetFinancesUseCase {
    FinancesData getFinances(Integer userId, Integer periodDays);
}
