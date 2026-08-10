package com.g9latam.team14.perfilfinanciero.infrastructure.adapter.outbound.database;

import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.entity.DeudaBancariaEntity;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository.DeudaBancariaJpaRepository;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import com.g9latam.team14.perfilfinanciero.domain.ports.outbound.PerfilFinancieroRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class PerfilFinancieroAdapter implements PerfilFinancieroRepositoryPort {

    private final PerfilJpaRepository perfilJpaRepository;
    private final MovementJpaRepository movementJpaRepository;
    private final DeudaBancariaJpaRepository deudaBancariaJpaRepository;

    @Override
    public BigDecimal getIngresoMensual(Integer userId) {
        BigDecimal valor = perfilJpaRepository.findIngresoMensualById(userId);
        return valor != null ? valor : BigDecimal.ZERO;
    }

    @Override
    @Transactional
    public void updateIngresoMensual(Integer userId, BigDecimal ingresoMensual) {
        perfilJpaRepository.updateIngresoMensual(userId, ingresoMensual);
    }

    @Override
    public String getFrecuenciaAhorro(Integer userId) {
        return perfilJpaRepository.findFrecuenciaAhorroById(userId);
    }

    @Override
    @Transactional
    public void updateFrecuenciaAhorro(Integer userId, String frecuenciaAhorro) {
        perfilJpaRepository.updateFrecuenciaAhorro(userId, frecuenciaAhorro);
    }

    @Override
    public BigDecimal promedioGastosMensuales(Integer userId, int meses) {
        LocalDate fin = LocalDate.now();
        LocalDate inicio = fin.minusMonths(meses).plusDays(1);
        BigDecimal total = movementJpaRepository.sumAmountByUserIdAndDateBetweenAndType(
                userId, inicio, fin, "expense"
        );
        if (total == null) {
            total = BigDecimal.ZERO;
        }
        return total.divide(BigDecimal.valueOf(meses), 2, RoundingMode.HALF_UP);
    }

    @Override
    public java.util.List<com.g9latam.team14.perfilfinanciero.domain.model.DebtProfile> getDeudasLegacy(Integer userId) {
        return deudaBancariaJpaRepository.findByUsuario(userId).stream()
                .map(this::toDebtProfile)
                .toList();
    }

    private com.g9latam.team14.perfilfinanciero.domain.model.DebtProfile toDebtProfile(DeudaBancariaEntity entity) {
        int mesesTotales = calcularMeses(entity.getFechaInicio(), entity.getFechaFin());
        int mesesPagados = calcularMeses(entity.getFechaInicio(), LocalDate.now());
        return new com.g9latam.team14.perfilfinanciero.domain.model.DebtProfile(
                entity.getId(),
                entity.getDescripcion() != null ? entity.getDescripcion() : "Deuda",
                entity.getMontoMensual() != null
                        ? BigDecimal.valueOf(entity.getMontoMensual().doubleValue()) : BigDecimal.ZERO,
                mesesTotales,
                Math.min(mesesPagados, mesesTotales)
        );
    }

    private int calcularMeses(LocalDate inicio, LocalDate fin) {
        if (inicio == null || fin == null) return 12;
        return Math.max(1, (int) ChronoUnit.MONTHS.between(inicio, fin));
    }
}
