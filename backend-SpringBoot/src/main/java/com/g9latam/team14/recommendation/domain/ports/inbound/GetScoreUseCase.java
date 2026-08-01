package com.g9latam.team14.recommendation.domain.ports.inbound;

import com.g9latam.team14.recommendation.domain.model.FinancialScore;

public interface GetScoreUseCase {
    FinancialScore getScore(Integer userId);
}
