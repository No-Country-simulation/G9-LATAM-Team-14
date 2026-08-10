package com.g9latam.team14.perfilfinanciero.domain.ports.outbound;

import com.g9latam.team14.perfilfinanciero.domain.model.DebtProfile;

import java.math.BigDecimal;
import java.util.List;

public interface PerfilFinancieroRepositoryPort {
    BigDecimal getIngresoMensual(Integer userId);
    void updateIngresoMensual(Integer userId, BigDecimal ingresoMensual);
    String getFrecuenciaAhorro(Integer userId);
    void updateFrecuenciaAhorro(Integer userId, String frecuenciaAhorro);
    BigDecimal promedioGastosMensuales(Integer userId, int meses);
    List<DebtProfile> getDeudasLegacy(Integer userId);
}
