package com.g9latam.team14.dashboard.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class DashboardSummary {
    private final BigDecimal totalIngresos;
    private final BigDecimal totalGastosFijos;
    private final BigDecimal totalGastosVariables;
    private final BigDecimal balanceNeto;
    private final List<String> alertas;
    private final List<String> recomendaciones;
}
