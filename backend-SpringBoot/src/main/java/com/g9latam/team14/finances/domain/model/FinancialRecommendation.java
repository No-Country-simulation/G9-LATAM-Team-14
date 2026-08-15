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
public class FinancialRecommendation {
    private String status;
    private String priority;
    private String strategy;
    private String message;
    private String nextAction;
    private Double confidencePercentage;
    private String relatedGoal;
    private List<String> appliedSafeguards;
    private List<String> reasons;
}
