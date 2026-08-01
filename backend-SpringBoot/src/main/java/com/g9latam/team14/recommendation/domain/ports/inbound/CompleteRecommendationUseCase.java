package com.g9latam.team14.recommendation.domain.ports.inbound;

import com.g9latam.team14.recommendation.domain.model.FinancialScore;

public interface CompleteRecommendationUseCase {
    FinancialScore complete(Integer userId, Integer recommendationId);
}
