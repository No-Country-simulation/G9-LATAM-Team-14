package com.g9latam.team14.movement.domain.ports.outbound;

import com.g9latam.team14.movement.domain.model.AiClassification;

public interface AiServicePort {
    AiClassification classifyMovement(String description, double amount, String direction, String note);
}
