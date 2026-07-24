package com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateMovementRequest(

        @NotBlank(message = "La descripción es obligatoria")
        String description,

        @NotNull(message = "El monto es obligatorio")
        BigDecimal amount,

        @NotBlank(message = "El tipo es obligatorio")
        String type,

        @NotBlank(message = "La categoría es obligatoria")
        String category,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate date,

        @NotNull(message = "El usuario es obligatorio")
        Integer userId

) {
}