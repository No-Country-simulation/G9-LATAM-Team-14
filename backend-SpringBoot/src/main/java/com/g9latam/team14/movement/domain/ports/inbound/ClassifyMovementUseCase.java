package com.g9latam.team14.movement.domain.ports.inbound;
import com.g9latam.team14.movement.domain.model.AiClassification;
public interface ClassifyMovementUseCase {
    AiClassification classifyMovement(String description, double amount, String direction, String note);
}
