package com.g9latam.team14.evolucion.domain.model;

import java.util.List;

public record DatosEvolucion(
        String ultimoMes,
        Integer ultimoScore,
        List<PerfilMensual> perfilMensual,
        List<FlujoDineroMes> ingresosVsGastos,
        List<EvaluacionHistorica> historial
) {
}
