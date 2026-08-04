package com.g9latam.team14.evolucion.domain.ports.inbound;

import com.g9latam.team14.evolucion.domain.model.EvolutionData;

public interface GetEvolutionUseCase {
    EvolutionData getEvolution(Integer userId, String rango);
}
