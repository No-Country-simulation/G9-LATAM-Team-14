package com.g9latam.team14.profile.domain.ports.inbound;
import java.math.BigDecimal;
public interface UpdatePerfilFinancieroUseCase {
    void updateIngresoMensual(Integer userId, BigDecimal ingresoMensual);
    void updateFrecuenciaAhorro(Integer userId, String frecuenciaAhorro);
}
