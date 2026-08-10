package com.g9latam.team14.perfilfinanciero.domain.model;

import java.math.BigDecimal;

public record NivelEndeudamiento(
        BigDecimal totalCuotasMensuales,
        Double porcentajeIngreso,
        String nivel
) {
}
