package com.g9latam.team14.movement.domain.ports.inbound;

import com.g9latam.team14.movement.domain.model.Movement;

import java.util.List;

public interface GetMovementsUseCase {

    List<Movement> getAllMovements();

}