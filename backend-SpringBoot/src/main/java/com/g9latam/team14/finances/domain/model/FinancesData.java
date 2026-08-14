package com.g9latam.team14.finances.domain.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancesData {
    private Integer periodDays;
    private FinancialStatus financialStatus;
    private FinancialRecommendation financialRecommendation;
}
