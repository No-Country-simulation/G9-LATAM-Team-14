package com.g9latam.team14.movement.domain.ports.outbound;

import com.g9latam.team14.movement.domain.model.Movement;
import java.util.List;

public interface MovementRepositoryPort {

    Movement save(Movement movement);

    List<Movement> findAll();

}