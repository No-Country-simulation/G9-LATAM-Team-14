package com.g9latam.team14.perfilfinanciero.domain.ports.inbound;

import java.math.BigDecimal;

public interface UpdatePerfilFinancieroUseCase {
    void updateIngresoMensual(Integer userId, BigDecimal ingresoMensual);
    void updateFrecuenciaAhorro(Integer userId, String frecuenciaAhorro);
}
