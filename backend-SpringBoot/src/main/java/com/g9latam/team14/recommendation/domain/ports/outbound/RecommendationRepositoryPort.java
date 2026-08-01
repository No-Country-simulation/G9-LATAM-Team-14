package com.g9latam.team14.recommendation.domain.ports.outbound;

import com.g9latam.team14.recommendation.domain.model.Recommendation;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RecommendationRepositoryPort {

    List<Recommendation> findByUserIdAndDateBetween(Integer userId, LocalDate start, LocalDate end);

    Optional<Recommendation> findByIdAndUserId(Integer id, Integer userId);

    Recommendation save(Recommendation recommendation);

    long count();

    List<Recommendation> saveAll(List<Recommendation> recommendations);
}
