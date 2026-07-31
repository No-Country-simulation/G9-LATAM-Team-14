package com.g9latam.team14.recommendation.application.service;

import com.g9latam.team14.recommendation.domain.model.FinancialScore;
import com.g9latam.team14.recommendation.domain.model.Recommendation;
import com.g9latam.team14.recommendation.domain.ports.inbound.CompleteRecommendationUseCase;
import com.g9latam.team14.recommendation.domain.ports.inbound.GetScoreUseCase;
import com.g9latam.team14.recommendation.domain.ports.outbound.RecommendationRepositoryPort;
import com.g9latam.team14.shared.infrastructure.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompleteRecommendationService implements CompleteRecommendationUseCase {

    private final RecommendationRepositoryPort recommendationRepository;
    private final GetScoreUseCase getScoreUseCase;

    @Override
    public FinancialScore complete(Integer userId, Integer recommendationId) {
        Recommendation recommendation = recommendationRepository
                .findByIdAndUserId(recommendationId, userId)
                .orElseThrow(() -> new CustomException("Recomendación no encontrada", HttpStatus.NOT_FOUND));

        if (!recommendation.isCompleted()) {
            Recommendation actualizada = Recommendation.builder()
                    .id(recommendation.getId())
                    .userId(recommendation.getUserId())
                    .priority(recommendation.getPriority())
                    .title(recommendation.getTitle())
                    .description(recommendation.getDescription())
                    .insight(recommendation.getInsight())
                    .actionLabel(recommendation.getActionLabel())
                    .impactPoints(recommendation.getImpactPoints())
                    .completed(true)
                    .date(recommendation.getDate())
                    .build();

            recommendationRepository.save(actualizada);
        }

        return getScoreUseCase.getScore(userId);
    }
}
