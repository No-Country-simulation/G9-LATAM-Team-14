package com.g9latam.team14.movement.infrastructure.adapter.outbound.database;

import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.outbound.MovementRepositoryPort;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.mapper.MovementEntityMapper;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MovementRepositoryAdapter implements MovementRepositoryPort {

    private final MovementJpaRepository movementJpaRepository;
    private final MovementEntityMapper movementEntityMapper;

    @Override
    public Movement save(Movement movement) {

        return movementEntityMapper.toDomain(
                movementJpaRepository.save(
                        movementEntityMapper.toEntity(movement)
                )
        );
    }
}