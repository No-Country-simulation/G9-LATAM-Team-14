package com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateMovementRequest(

        @NotBlank(message = "La descripción es obligatoria")
        String description,

        @NotNull(message = "El monto es obligatorio")
        BigDecimal amount,

        @NotBlank(message = "El tipo es obligatorio")
        String type,

        String category,

        @NotBlank(message = "La fecha es obligatoria")
        String date,

        String note,
        Integer userId

) {
}