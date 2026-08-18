package com.g9latam.team14.finances.domain.ports.outbound;
import com.g9latam.team14.finances.domain.model.FinancesData;
public interface DsRecommendationServicePort {
    FinancesData fetchRecommendationAndStatus(
            Integer userId,
            double totalIncome,
            double totalExpenses,
            double debtPayments,
            double debtBalance,
            String incomeStatus,
            double incomeVariability,
            int periodsWithoutIncome,
            int observedPeriods,
            Integer periodDays,
            int confirmedMovementsCount
    );
}
