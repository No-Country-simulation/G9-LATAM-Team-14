package com.g9latam.team14.recommendation.domain.ports.inbound;

import com.g9latam.team14.recommendation.domain.model.Recommendation;

import java.util.List;

public interface GetRecommendationsUseCase {
    List<Recommendation> getForCurrentMonth(Integer userId);
}
