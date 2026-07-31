package com.g9latam.team14.recommendation.infrastructure.adapter.outbound.database.mapper;

import com.g9latam.team14.recommendation.domain.model.Recommendation;
import com.g9latam.team14.recommendation.infrastructure.adapter.outbound.database.entity.RecomendacionEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RecommendationEntityMapper {

    public Recommendation toDomain(RecomendacionEntity entity) {
        return Recommendation.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .priority(entity.getPriority())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .insight(entity.getInsight())
                .actionLabel(entity.getActionLabel())
                .impactPoints(entity.getImpactPoints())
                .completed(entity.isCompleted())
                .date(entity.getDate())
                .build();
    }

    public RecomendacionEntity toEntity(Recommendation recommendation) {
        return new RecomendacionEntity(
                recommendation.getId(),
                recommendation.getUserId(),
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

    public List<Recommendation> toDomainList(List<RecomendacionEntity> entities) {
        return entities.stream()
                .map(this::toDomain)
                .toList();
    }
}
