package com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos;
import jakarta.validation.constraints.NotBlank;
public record ConfirmMovementRequest(
        @NotBlank(message = "La categoría es obligatoria")
        String category,
        String regularity,
        Integer debtId
) {
}
