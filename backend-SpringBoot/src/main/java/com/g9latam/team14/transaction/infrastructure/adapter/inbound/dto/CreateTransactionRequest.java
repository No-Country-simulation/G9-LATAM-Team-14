package com.g9latam.team14.transaction.infrastructure.adapter.inbound.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTransactionRequest(

        @NotNull
        LocalDate transactionDate,

        @NotBlank
        @Size(max = 250)
        String description,

        @Size(max = 300)
        String note,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal amount,

        @NotBlank
        String direction
) {
}