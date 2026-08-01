package com.g9latam.team14.recommendation.infrastructure.adapter.inbound.dtos;

public record ScoreResponse(
        int scoreActual,
        int scorePotencial,
        int accionesCompletadas,
        int accionesTotales
) {
}
