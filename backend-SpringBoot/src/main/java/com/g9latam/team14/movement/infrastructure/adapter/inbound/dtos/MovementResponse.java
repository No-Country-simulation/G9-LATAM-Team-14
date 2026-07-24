package com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovementResponse(

        Integer id,
        String description,
        BigDecimal amount,
        String type,
        String category,
        LocalDate date,
        Integer userId

) {
}