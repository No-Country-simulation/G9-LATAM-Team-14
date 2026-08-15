package com.g9latam.team14.evolucion.domain.model;
import java.util.List;
public record PerfilMensual(
        String mes,
        Integer score,
        String estado,
        List<PuntuacionDiaria> puntuacionesDiarias
) {
}
