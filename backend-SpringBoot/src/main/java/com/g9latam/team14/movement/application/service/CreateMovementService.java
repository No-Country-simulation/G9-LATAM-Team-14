package com.g9latam.team14.movement.application.service;
import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.inbound.CreateMovementUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.g9latam.team14.movement.domain.ports.outbound.MovementRepositoryPort;

@Service
@RequiredArgsConstructor
public class CreateMovementService implements CreateMovementUseCase {
    private final MovementRepositoryPort movementRepository;
    @Override
    public Movement createMovement(Movement movement) {
        return movementRepository.save(movement);
    }
}