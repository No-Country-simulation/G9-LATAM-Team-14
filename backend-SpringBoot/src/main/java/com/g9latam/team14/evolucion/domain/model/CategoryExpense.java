package com.g9latam.team14.evolucion.domain.model;

import java.math.BigDecimal;

public record CategoryExpense(
        String categoria,
        BigDecimal monto,
        BigDecimal porcentaje
) {
}
