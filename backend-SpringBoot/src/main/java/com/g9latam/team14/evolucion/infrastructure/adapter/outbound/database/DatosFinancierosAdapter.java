package com.g9latam.team14.evolucion.infrastructure.adapter.outbound.database;

import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.entity.DebtEntity;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.repository.SpringDataDebtRepository;
import com.g9latam.team14.evolucion.domain.ports.outbound.DatosFinancierosPort;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.entity.MovementEntity;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DatosFinancierosAdapter implements DatosFinancierosPort {

    private final MovementJpaRepository movementJpaRepository;
    private final SpringDataDebtRepository springDataDebtRepository;

    @Override
    public Map<YearMonth, BigDecimal> ingresosAgrupados(Integer usuarioId, YearMonth desde, YearMonth hasta) {
        return agruparMovimientos(usuarioId, "INGRESO", desde, hasta);
    }

    @Override
    public Map<YearMonth, BigDecimal> gastosAgrupados(Integer usuarioId, YearMonth desde, YearMonth hasta) {
        return agruparMovimientos(usuarioId, "GASTO", desde, hasta);
    }

    @Override
    public Map<YearMonth, BigDecimal> deudasAgrupadas(Integer usuarioId, YearMonth desde, YearMonth hasta) {
        Map<YearMonth, BigDecimal> resultado = new HashMap<>();
        if (usuarioId == null) return resultado;

        List<DebtEntity> deudas = springDataDebtRepository.findByUserIdAndStatus(usuarioId, DebtStatus.ACTIVE);

        YearMonth cursor = desde;
        while (!cursor.isAfter(hasta)) {
            LocalDate primerDia = cursor.atDay(1);
            LocalDate ultimoDia = cursor.atEndOfMonth();
            BigDecimal totalMes = deudas.stream()
                    .filter(d -> estaActiva(d, primerDia, ultimoDia))
                    .map(d -> d.getMonthlyAmount() != null ? d.getMonthlyAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            resultado.put(cursor, totalMes);
            cursor = cursor.plusMonths(1);
        }
        return resultado;
    }

    @Override
    public Map<LocalDate, BigDecimal> ingresosDiarios(Integer usuarioId, LocalDate desde, LocalDate hasta) {
        return agruparMovimientosDiarios(usuarioId, "INGRESO", desde, hasta);
    }

    @Override
    public Map<LocalDate, BigDecimal> gastosDiarios(Integer usuarioId, LocalDate desde, LocalDate hasta) {
        return agruparMovimientosDiarios(usuarioId, "GASTO", desde, hasta);
    }

    private Map<YearMonth, BigDecimal> agruparMovimientos(Integer usuarioId, String tipo, YearMonth desde, YearMonth hasta) {
        Map<YearMonth, BigDecimal> mapa = new HashMap<>();
        if (usuarioId == null) return mapa;

        List<MovementEntity> todos = movementJpaRepository.findByUserIdOrderByDateDesc(usuarioId);
        for (MovementEntity m : todos) {
            if (!tipo.equalsIgnoreCase(m.getType())) continue;
            YearMonth mes = parsearMes(m.getDate());
            if (mes == null || mes.isBefore(desde) || mes.isAfter(hasta)) continue;
            mapa.merge(mes, m.getAmount() != null ? m.getAmount() : BigDecimal.ZERO, BigDecimal::add);
        }
        return mapa;
    }

    private Map<LocalDate, BigDecimal> agruparMovimientosDiarios(Integer usuarioId, String tipo, LocalDate desde, LocalDate hasta) {
        Map<LocalDate, BigDecimal> mapa = new HashMap<>();
        if (usuarioId == null) return mapa;

        List<MovementEntity> todos = movementJpaRepository.findByUserIdOrderByDateDesc(usuarioId);
        for (MovementEntity m : todos) {
            if (!tipo.equalsIgnoreCase(m.getType())) continue;
            LocalDate fecha = parsearFecha(m.getDate());
            if (fecha == null || fecha.isBefore(desde) || fecha.isAfter(hasta)) continue;
            mapa.merge(fecha, m.getAmount() != null ? m.getAmount() : BigDecimal.ZERO, BigDecimal::add);
        }
        return mapa;
    }

    private YearMonth parsearMes(String fecha) {
        if (fecha == null || fecha.length() < 7) return null;
        try {
            return YearMonth.parse(fecha.substring(0, 7));
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDate parsearFecha(String fecha) {
        if (fecha == null || fecha.length() < 10) return null;
        try {
            return LocalDate.parse(fecha.substring(0, 10));
        } catch (Exception e) {
            return null;
        }
    }

    private boolean estaActiva(DebtEntity d, LocalDate primerDia, LocalDate ultimoDia) {
        boolean noEmpezoDespues = d.getStartDate() == null || !d.getStartDate().isAfter(ultimoDia);
        boolean noTerminoAntes = d.getEndDate() == null || !d.getEndDate().isBefore(primerDia);
        return noEmpezoDespues && noTerminoAntes;
    }
}
