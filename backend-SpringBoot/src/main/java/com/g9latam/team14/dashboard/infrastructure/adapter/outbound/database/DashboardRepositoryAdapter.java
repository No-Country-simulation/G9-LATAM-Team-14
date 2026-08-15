package com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database;

import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.entity.DebtEntity;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.repository.SpringDataDebtRepository;
import com.g9latam.team14.dashboard.domain.ports.outbound.DashboardRepositoryPort;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository.DeudaBancariaJpaRepository;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository.IngresoJpaRepository;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.entity.MovementEntity;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DashboardRepositoryAdapter implements DashboardRepositoryPort {

    private final IngresoJpaRepository ingresoRepository;
    private final DeudaBancariaJpaRepository deudaBancariaRepository;
    private final MovementJpaRepository movementRepository;
    private final SpringDataDebtRepository springDataDebtRepository;

    @Override
    public BigDecimal sumIngresosByUserIdAndDates(Integer userId, LocalDate start, LocalDate end) {
        BigDecimal sumMovements = agruparMovimientosPorTipo(userId, "INGRESO", start, end);
        if (sumMovements.compareTo(BigDecimal.ZERO) > 0) {
            return sumMovements;
        }
        BigDecimal sumLegacy = ingresoRepository.sumMontoByIdUsuarioAndFechaIngresoBetween(userId, start, end);
        return sumLegacy != null ? sumLegacy : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal sumGastosFijosByUserId(Integer userId) {
        if (userId == null) return BigDecimal.ZERO;
        List<DebtEntity> deudas = springDataDebtRepository.findByUserIdAndStatus(userId, DebtStatus.ACTIVE);
        BigDecimal totalDeudas = deudas.stream()
                .map(d -> d.getMonthlyAmount() != null ? d.getMonthlyAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalDeudas.compareTo(BigDecimal.ZERO) > 0) {
            return totalDeudas;
        }

        BigDecimal legacyGastos = deudaBancariaRepository.sumMontoMensualByUsuario(userId);
        return legacyGastos != null ? legacyGastos : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal sumGastosVariablesByUserIdAndDates(Integer userId, LocalDate start, LocalDate end) {
        return agruparMovimientosPorTipo(userId, "GASTO", start, end);
    }

    private BigDecimal agruparMovimientosPorTipo(Integer userId, String tipo, LocalDate start, LocalDate end) {
        if (userId == null) return BigDecimal.ZERO;
        List<MovementEntity> todos = movementRepository.findByUserIdOrderByDateDesc(userId);
        BigDecimal suma = BigDecimal.ZERO;
        for (MovementEntity m : todos) {
            if (!tipo.equalsIgnoreCase(m.getType())) continue;
            LocalDate fecha = parsearFecha(m.getDate());
            if (fecha == null || fecha.isBefore(start) || fecha.isAfter(end)) continue;
            suma = suma.add(m.getAmount() != null ? m.getAmount() : BigDecimal.ZERO);
        }
        return suma;
    }

    private LocalDate parsearFecha(String fecha) {
        if (fecha == null || fecha.length() < 10) return null;
        try {
            return LocalDate.parse(fecha.substring(0, 10));
        } catch (Exception e) {
            return null;
        }
    }
}
