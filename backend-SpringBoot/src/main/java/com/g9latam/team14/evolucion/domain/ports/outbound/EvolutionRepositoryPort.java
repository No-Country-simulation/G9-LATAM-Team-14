package com.g9latam.team14.evolucion.domain.ports.outbound;

import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository.IngresoJpaRepository;

import java.time.YearMonth;
import java.util.List;

/**
 * Expone las agregaciones mensuales necesarias para la evolución financiera.
 * Las proyecciones intermedias viven en cada repositorio JPA.
 */
public interface EvolutionRepositoryPort {

    List<IngresoJpaRepository.MonthlyTotal> sumIngresosMensuales(
            Integer userId, YearMonth inicio, YearMonth fin
    );

    List<MovementJpaRepository.MonthlyTotal> sumGastosMensuales(
            Integer userId, YearMonth inicio, YearMonth fin
    );

    List<MovementJpaRepository.CategoryTotal> sumGastosPorCategoria(
            Integer userId, YearMonth inicio, YearMonth fin
    );

    List<MonthlyDebt> sumDeudasMensuales(Integer userId, YearMonth inicio, YearMonth fin);

    record MonthlyDebt(YearMonth mes, java.math.BigDecimal total) {
    }
}
