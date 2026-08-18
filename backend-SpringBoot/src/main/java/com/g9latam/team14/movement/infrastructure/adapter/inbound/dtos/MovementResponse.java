package com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos;

import java.math.BigDecimal;

public record MovementResponse(
        Integer id,
        String description,
        BigDecimal amount,
        String type,
        String category,
        String regularity,
        String date,
        String note,
        Integer userId,
        String status,
        AiClassificationResponse modelSuggestion
) {
}
