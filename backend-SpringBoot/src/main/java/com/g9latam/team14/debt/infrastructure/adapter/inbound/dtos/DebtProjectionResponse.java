package com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos;
import java.math.BigDecimal;
import java.util.List;
public record DebtProjectionResponse(
        List<ProjectionPointDto> projection
) {
    public record ProjectionPointDto(
            String month,
            BigDecimal balance
    ) {}
}
