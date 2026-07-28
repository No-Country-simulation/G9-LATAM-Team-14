package com.g9latam.team14.dashboard.infrastructure.adapter.inbound.dtos;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryResponse(
        BigDecimal totalIngresos,
        BigDecimal totalGastosFijos,
        BigDecimal totalGastosVariables,
        BigDecimal balanceNeto,
        List<String> alertas,
        List<String> recomendaciones
) {
}
