package com.g9latam.team14.finances.domain.ports.outbound;
import com.g9latam.team14.finances.domain.model.FinancesData;
public interface DsRecommendationServicePort {
    FinancesData fetchRecommendationAndStatus(Integer userId, double totalIncome, double totalExpenses, double debtPayments, Integer periodDays, int confirmedMovementsCount);
}
