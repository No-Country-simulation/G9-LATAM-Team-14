package com.g9latam.team14.evolucion.domain.model;

import java.math.BigDecimal;
import java.util.List;

public record EvolutionData(
        String rango,
        String ultimoMes,
        Integer ultimoScore,
        List<MonthlyProfile> perfilMensual,
        List<IncomeVsExpensesPoint> ingresosVsGastos,
        List<CategoryExpense> gastosPorCategoria,
        BigDecimal gastoTotalMes,
        BigDecimal variacionGasto,
        List<AnalysisHistoryRow> historial
) {
}
