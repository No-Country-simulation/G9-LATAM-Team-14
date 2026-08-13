package com.g9latam.team14.transaction.infrastructure.adapter.inbound.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmTransactionRequest(

        @NotBlank(message = "La categoría es obligatoria")
        String category,

        @NotBlank(message = "El propósito es obligatorio")
        String purpose,

        @NotBlank(message = "La regularidad es obligatoria")
        String regularity

) {
}