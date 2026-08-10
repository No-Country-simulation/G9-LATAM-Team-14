package com.g9latam.team14.evolucion.domain.model;

import java.math.BigDecimal;

public record IncomeVsExpensesPoint(
        String mes,
        BigDecimal ingresos,
        BigDecimal gastos,
        BigDecimal deudas
) {
}
