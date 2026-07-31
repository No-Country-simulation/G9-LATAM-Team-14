package com.g9latam.team14.recommendation.application.service;

import com.g9latam.team14.recommendation.domain.model.Recommendation;
import com.g9latam.team14.recommendation.domain.ports.inbound.GetRecommendationsUseCase;
import com.g9latam.team14.recommendation.domain.ports.outbound.RecommendationRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GetRecommendationsService implements GetRecommendationsUseCase {

    private final RecommendationRepositoryPort recommendationRepository;

    @Override
    public List<Recommendation> getForCurrentMonth(Integer userId) {
        YearMonth mesActual = YearMonth.now();
        LocalDate inicioMes = mesActual.atDay(1);
        LocalDate finMes = mesActual.atEndOfMonth();

        return recommendationRepository.findByUserIdAndDateBetween(userId, inicioMes, finMes);
    }
}
