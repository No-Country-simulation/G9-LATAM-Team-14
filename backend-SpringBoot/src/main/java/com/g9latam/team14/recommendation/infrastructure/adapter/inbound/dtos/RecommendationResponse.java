package com.g9latam.team14.recommendation.infrastructure.adapter.inbound.dtos;

import com.g9latam.team14.recommendation.domain.model.Prioridad;

import java.time.LocalDate;

public record RecommendationResponse(
        Integer id,
        Prioridad prioridad,
        String titulo,
        String descripcion,
        String insight,
        String accionLabel,
        int impacto,
        boolean completada,
        LocalDate fecha
) {
}
