package com.g9latam.team14.movement.domain.ports.inbound;
import com.g9latam.team14.movement.domain.model.Movement;
public interface CreateMovementUseCase {
    Movement createMovement(Movement movement);
    Movement confirmMovement(Integer id, String category, String regularity, Integer debtId);
}