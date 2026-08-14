package com.g9latam.team14.finances.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialStatus {
    private String status;
    private String currentState;
    private String trajectory;
    private Double confidencePercentage;
    private Integer daysWithHistory;
    private Integer confirmedMovements;
    private String dateRangeText;
    private List<ObservedFactor> mainFactors;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ObservedFactor {
        private String name;
        private String assessment;
    }
}
