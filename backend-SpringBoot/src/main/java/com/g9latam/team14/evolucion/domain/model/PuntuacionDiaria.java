package com.g9latam.team14.evolucion.domain.model;
import java.math.BigDecimal;
public record PuntuacionDiaria(
        String dia,
        Integer score,
        BigDecimal ingresos,
        BigDecimal gastos
) {
}
