package com.g9latam.team14.evolucion.domain.model;

import java.math.BigDecimal;

public record AnalysisHistoryRow(
        String fecha,
        String estado,
        Integer score,
        BigDecimal ingresos,
        BigDecimal gastos
) {
}
