package com.g9latam.team14.perfilfinanciero.domain.model;

import java.math.BigDecimal;
import java.util.List;

public record PerfilFinanciero(
        BigDecimal ingresoMensual,
        List<DebtProfile> deudas,
        NivelEndeudamiento nivelEndeudamiento,
        String frecuenciaAhorro,
        ProyeccionMensual proyeccionMensual
) {
}
