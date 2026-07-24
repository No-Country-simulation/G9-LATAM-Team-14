package com.g9latam.team14.movement.infrastructure.adapter.outbound.database.mapper;

import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.entity.MovementEntity;
import org.springframework.stereotype.Component;

@Component
public class MovementEntityMapper {

    public Movement toDomain(MovementEntity entity) {
        return Movement.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .type(entity.getType())
                .category(entity.getCategory())
                .date(entity.getDate())
                .userId(entity.getUserId())
                .build();
    }

    public MovementEntity toEntity(Movement movement) {
        return new MovementEntity(
                movement.getId(),
                movement.getDescription(),
                movement.getAmount(),
                movement.getType(),
                movement.getCategory(),
                movement.getDate(),
                movement.getUserId()
        );
    }
}