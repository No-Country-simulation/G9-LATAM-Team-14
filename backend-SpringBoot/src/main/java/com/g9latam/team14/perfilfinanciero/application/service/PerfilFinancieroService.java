package com.g9latam.team14.perfilfinanciero.application.service;

import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.GetDebtsUseCase;
import com.g9latam.team14.perfilfinanciero.domain.model.DebtProfile;
import com.g9latam.team14.perfilfinanciero.domain.model.NivelEndeudamiento;
import com.g9latam.team14.perfilfinanciero.domain.model.PerfilFinanciero;
import com.g9latam.team14.perfilfinanciero.domain.model.ProyeccionMensual;
import com.g9latam.team14.perfilfinanciero.domain.ports.inbound.GetPerfilFinancieroUseCase;
import com.g9latam.team14.perfilfinanciero.domain.ports.inbound.UpdatePerfilFinancieroUseCase;
import com.g9latam.team14.perfilfinanciero.domain.ports.outbound.PerfilFinancieroRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PerfilFinancieroService implements GetPerfilFinancieroUseCase, UpdatePerfilFinancieroUseCase {

    private static final BigDecimal CERO = BigDecimal.ZERO;

    private final PerfilFinancieroRepositoryPort perfilRepository;
    private final GetDebtsUseCase getDebtsUseCase;

    @Override
    public PerfilFinanciero getPerfil(Integer userId) {
        BigDecimal ingresoMensual = perfilRepository.getIngresoMensual(userId);
        if (ingresoMensual == null) {
            ingresoMensual = CERO;
        }

        List<Debt> deudasModerna = getDebtsUseCase.getAllDebtsByUserId(userId);
        List<DebtProfile> deudasModernaPerfil = deudasModerna.stream()
                .filter(d -> d.getStatus() == DebtStatus.ACTIVE)
                .map(d -> new DebtProfile(
                        d.getId(),
                        d.getCategory(),
                        d.getMonthlyAmount() != null ? d.getMonthlyAmount() : CERO,
                        d.getMonthsTerm(),
                        d.getPaidInstallments()
                ))
                .toList();

        List<DebtProfile> deudasLegacy = perfilRepository.getDeudasLegacy(userId);

        List<DebtProfile> todasDeudas = new java.util.ArrayList<>(deudasModernaPerfil);
        todasDeudas.addAll(deudasLegacy);

        BigDecimal totalCuotas = todasDeudas.stream()
                .map(DebtProfile::monthlyAmount)
                .reduce(CERO, BigDecimal::add);

        Double porcentajeIngreso = ingresoMensual.compareTo(CERO) > 0
                ? totalCuotas.multiply(new BigDecimal("100"))
                        .divide(ingresoMensual, 1, RoundingMode.HALF_UP)
                        .doubleValue()
                : 0.0;

        NivelEndeudamiento nivelEndeudamiento = new NivelEndeudamiento(
                totalCuotas.setScale(2, RoundingMode.HALF_UP),
                porcentajeIngreso,
                calcularNivel(porcentajeIngreso)
        );

        String frecuenciaAhorro = perfilRepository.getFrecuenciaAhorro(userId);
        if (frecuenciaAhorro == null) {
            frecuenciaAhorro = "MEDIA";
        }

        BigDecimal gastoPromedio = perfilRepository.promedioGastosMensuales(userId, 3);

        BigDecimal cuotasDeuda = totalCuotas.setScale(2, RoundingMode.HALF_UP);
        BigDecimal capacidadAhorro = ingresoMensual
                .subtract(cuotasDeuda)
                .subtract(gastoPromedio)
                .setScale(2, RoundingMode.HALF_UP);

        ProyeccionMensual proyeccion = new ProyeccionMensual(
                ingresoMensual.setScale(2, RoundingMode.HALF_UP),
                cuotasDeuda,
                gastoPromedio,
                capacidadAhorro
        );

        return new PerfilFinanciero(
                ingresoMensual.setScale(2, RoundingMode.HALF_UP),
                todasDeudas,
                nivelEndeudamiento,
                frecuenciaAhorro,
                proyeccion
        );
    }

    @Override
    public void updateIngresoMensual(Integer userId, BigDecimal ingresoMensual) {
        perfilRepository.updateIngresoMensual(userId, ingresoMensual);
    }

    @Override
    public void updateFrecuenciaAhorro(Integer userId, String frecuenciaAhorro) {
        perfilRepository.updateFrecuenciaAhorro(userId, frecuenciaAhorro);
    }

    private String calcularNivel(double porcentaje) {
        if (porcentaje >= 60) return "Crítico";
        if (porcentaje >= 35) return "Riesgoso";
        if (porcentaje >= 25) return "Manejable";
        return "Saludable";
    }
}
