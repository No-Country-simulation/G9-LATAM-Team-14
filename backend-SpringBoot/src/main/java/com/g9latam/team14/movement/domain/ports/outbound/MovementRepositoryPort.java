package com.g9latam.team14.movement.domain.ports.outbound;
import com.g9latam.team14.movement.domain.model.Movement;
import java.util.List;
import java.util.Optional;
public interface MovementRepositoryPort {
    Movement save(Movement movement);
    Optional<Movement> findById(Integer id);
    List<Movement> findAll();
}