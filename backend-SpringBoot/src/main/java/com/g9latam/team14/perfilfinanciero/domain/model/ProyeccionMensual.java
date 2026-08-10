package com.g9latam.team14.perfilfinanciero.domain.model;

import java.math.BigDecimal;

public record ProyeccionMensual(
        BigDecimal ingreso,
        BigDecimal cuotasDeuda,
        BigDecimal gastoPromedio,
        BigDecimal capacidadAhorro
) {
}
