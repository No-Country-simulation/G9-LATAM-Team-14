package com.g9latam.team14.profile.domain.ports.outbound;
import com.g9latam.team14.profile.domain.model.DebtProfile;
import java.math.BigDecimal;
import java.util.List;
public interface PerfilFinancieroRepositoryPort {
    BigDecimal getIngresoMensual(Integer userId);
    void updateIngresoMensual(Integer userId, BigDecimal ingresoMensual);
    List<DebtProfile> getDeudasLegacy(Integer userId);
    String getFrecuenciaAhorro(Integer userId);
    void updateFrecuenciaAhorro(Integer userId, String frecuenciaAhorro);
    BigDecimal promedioGastosMensuales(Integer userId, int meses);
}
