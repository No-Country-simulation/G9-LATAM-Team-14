package com.g9latam.team14.evolucion.infrastructure.adapter.outbound.database;

import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.entity.DeudaBancariaEntity;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository.DeudaBancariaJpaRepository;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository.IngresoJpaRepository;
import com.g9latam.team14.evolucion.domain.ports.outbound.EvolutionRepositoryPort;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EvolutionRepositoryAdapter implements EvolutionRepositoryPort {

    private final IngresoJpaRepository ingresoRepository;
    private final DeudaBancariaJpaRepository deudaBancariaRepository;
    private final MovementJpaRepository movementRepository;

    @Override
    public List<IngresoJpaRepository.MonthlyTotal> sumIngresosMensuales(
            Integer userId, YearMonth inicio, YearMonth fin
    ) {
        return ingresoRepository.sumMontoMonthlyByIdUsuarioAndFechaIngresoBetween(
                userId, inicio.atDay(1), fin.atEndOfMonth()
        );
    }

    @Override
    public List<MovementJpaRepository.MonthlyTotal> sumGastosMensuales(
            Integer userId, YearMonth inicio, YearMonth fin
    ) {
        return movementRepository.sumAmountMonthlyByUserIdAndDateBetweenAndType(
                userId, inicio.atDay(1), fin.atEndOfMonth(), "expense"
        );
    }

    @Override
    public List<MovementJpaRepository.CategoryTotal> sumGastosPorCategoria(
            Integer userId, YearMonth inicio, YearMonth fin
    ) {
        return movementRepository.sumAmountByCategoryAndDateBetweenAndType(
                userId, inicio.atDay(1), fin.atEndOfMonth(), "expense"
        );
    }

    @Override
    public List<MonthlyDebt> sumDeudasMensuales(Integer userId, YearMonth inicio, YearMonth fin) {
        List<DeudaBancariaEntity> deudas = deudaBancariaRepository.findByUsuario(userId);
        List<MonthlyDebt> resultado = new ArrayList<>();
        YearMonth cursor = inicio;
        while (!cursor.isAfter(fin)) {
            LocalDate inicioMes = cursor.atDay(1);
            LocalDate finMes = cursor.atEndOfMonth();
            BigDecimal total = deudas.stream()
                    .filter(d -> estaActivaEnMes(d, inicioMes, finMes))
                    .map(DeudaBancariaEntity::getMontoMensual)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            resultado.add(new MonthlyDebt(cursor, total));
            cursor = cursor.plusMonths(1);
        }
        return resultado;
    }

    private boolean estaActivaEnMes(DeudaBancariaEntity deuda, LocalDate inicioMes, LocalDate finMes) {
        boolean iniciaAntes = deuda.getFechaInicio() == null || !deuda.getFechaInicio().isAfter(finMes);
        boolean finalizaDespues = deuda.getFechaFin() == null || !deuda.getFechaFin().isBefore(inicioMes);
        return iniciaAntes && finalizaDespues;
    }
}
