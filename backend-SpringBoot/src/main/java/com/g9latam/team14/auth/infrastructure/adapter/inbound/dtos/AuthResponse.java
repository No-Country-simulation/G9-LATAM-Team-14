package com.g9latam.team14.auth.infrastructure.adapter.inbound.dtos;

public record AuthResponse(
        String token,
        String tokenType,
        long expiresIn,
        UserInfo user
) {
    public record UserInfo(
            Integer id,
            String email,
            String nombreUsuario,
            Boolean onboardingCompleted,
            Float ingresoMensual,
            String frecuenciaAhorro,
            String actividadPrincipal,
            String ocupacionCuoc,
            Double confianzaIaPct,
            String resultadoIaJson
    ) {
    }
}
