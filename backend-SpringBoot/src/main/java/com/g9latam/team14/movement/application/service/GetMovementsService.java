package com.g9latam.team14.movement.application.service;

import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.inbound.GetMovementsUseCase;
import com.g9latam.team14.movement.domain.ports.outbound.MovementRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetMovementsService implements GetMovementsUseCase {

    private final MovementRepositoryPort movementRepository;

    @Override
    public List<Movement> getAllMovements() {
        return movementRepository.findAll();
    }
}