package com.g9latam.team14.profile.infrastructure.adapter.inbound.dtos;

import java.math.BigDecimal;
import java.util.List;

public record ProfileResponse(
        Integer userId,
        String email,
        String nombreUsuario,
        BigDecimal ingresoMensual,
        String actividadPrincipal,
        String frecuenciaAhorro,
        String ocupacionCuoc,
        Double confianzaIaPct,
        String resultadoIaJson,
        Boolean onboardingCompleted,
        String primaryIncomeModality,
        String nextGoal,
        List<String> hobbies,
        String financialResponsibility
) {
}
