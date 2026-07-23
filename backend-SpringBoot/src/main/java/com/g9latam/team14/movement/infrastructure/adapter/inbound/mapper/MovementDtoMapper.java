package com.g9latam.team14.movement.infrastructure.adapter.inbound.mapper;

import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.CreateMovementRequest;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.MovementResponse;
import org.springframework.stereotype.Component;

@Component
public class MovementDtoMapper {

    public Movement toDomain(CreateMovementRequest request) {

        return Movement.builder()
                .id(null)
                .description(request.description())
                .amount(request.amount())
                .type(request.type())
                .category(request.category())
                .date(request.date())
                .userId(request.userId())
                .build();
    }

    public MovementResponse toResponse(Movement movement) {

        return new MovementResponse(
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