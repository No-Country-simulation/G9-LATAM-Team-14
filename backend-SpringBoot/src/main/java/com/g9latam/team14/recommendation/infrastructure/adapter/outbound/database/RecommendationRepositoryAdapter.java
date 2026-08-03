package com.g9latam.team14.recommendation.infrastructure.adapter.outbound.database;

import com.g9latam.team14.recommendation.domain.model.Recommendation;
import com.g9latam.team14.recommendation.domain.ports.outbound.RecommendationRepositoryPort;
import com.g9latam.team14.recommendation.infrastructure.adapter.outbound.database.mapper.RecommendationEntityMapper;
import com.g9latam.team14.recommendation.infrastructure.adapter.outbound.database.repository.RecomendacionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RecommendationRepositoryAdapter implements RecommendationRepositoryPort {

    private final RecomendacionJpaRepository recomendacionJpaRepository;
    private final RecommendationEntityMapper recommendationEntityMapper;

    @Override
    public List<Recommendation> findByUserIdAndDateBetween(Integer userId, LocalDate start, LocalDate end) {
        return recommendationEntityMapper.toDomainList(
                recomendacionJpaRepository.findByUserIdAndDateBetween(userId, start, end)
        );
    }

    @Override
    public Optional<Recommendation> findByIdAndUserId(Integer id, Integer userId) {
        return recomendacionJpaRepository.findByIdAndUserId(id, userId)
                .map(recommendationEntityMapper::toDomain);
    }

    @Override
    public Recommendation save(Recommendation recommendation) {
        return recommendationEntityMapper.toDomain(
                recomendacionJpaRepository.save(
                        recommendationEntityMapper.toEntity(recommendation)
                )
        );
    }

    @Override
    public long count() {
        return recomendacionJpaRepository.count();
    }

    @Override
    public List<Recommendation> saveAll(List<Recommendation> recommendations) {
        List<com.g9latam.team14.recommendation.infrastructure.adapter.outbound.database.entity.RecomendacionEntity> entities =
                recommendations.stream()
                        .map(recommendationEntityMapper::toEntity)
                        .toList();
        return recommendationEntityMapper.toDomainList(
                recomendacionJpaRepository.saveAll(entities)
        );
    }
}
