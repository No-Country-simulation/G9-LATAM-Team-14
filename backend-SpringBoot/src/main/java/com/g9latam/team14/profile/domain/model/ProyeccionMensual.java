package com.g9latam.team14.profile.domain.model;
import java.math.BigDecimal;
public record ProyeccionMensual(
    BigDecimal ingresoTotal,
    BigDecimal cuotasDeuda,
    BigDecimal gastosEstimados,
    BigDecimal capacidadAhorro
) {}
