package com.g9latam.team14.recommendation.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class FinancialScore {
    private final int currentScore;
    private final int potentialScore;
    private final int completedActions;
    private final int totalActions;
}
