package com.g9latam.team14.movement.application.service;

import com.g9latam.team14.movement.domain.model.AiClassification;
import com.g9latam.team14.movement.domain.ports.inbound.ClassifyMovementUseCase;
import com.g9latam.team14.movement.domain.ports.outbound.AiServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassifyMovementService implements ClassifyMovementUseCase {
    private final AiServicePort aiService;

    @Override
    public AiClassification classifyMovement(String description, double amount, String direction, String note) {
        return aiService.classifyMovement(description, amount, direction, note);
    }
}
