package com.g9latam.team14.recommendation.infrastructure.adapter.inbound.mapper;

import com.g9latam.team14.recommendation.domain.model.FinancialScore;
import com.g9latam.team14.recommendation.domain.model.Recommendation;
import com.g9latam.team14.recommendation.infrastructure.adapter.inbound.dtos.RecommendationResponse;
import com.g9latam.team14.recommendation.infrastructure.adapter.inbound.dtos.ScoreResponse;
import org.springframework.stereotype.Component;

@Component
public class RecommendationDtoMapper {

    public RecommendationResponse toResponse(Recommendation recommendation) {
        return new RecommendationResponse(
                recommendation.getId(),
                recommendation.getPriority(),
                recommendation.getTitle(),
                recommendation.getDescription(),
                recommendation.getInsight(),
                recommendation.getActionLabel(),
                recommendation.getImpactPoints(),
                recommendation.isCompleted(),
                recommendation.getDate()
        );
    }

    public ScoreResponse toResponse(FinancialScore score) {
        return new ScoreResponse(
                score.getCurrentScore(),
                score.getPotentialScore(),
                score.getCompletedActions(),
                score.getTotalActions()
        );
    }
}
