package com.g9latam.team14.evolucion.infrastructure.adapter.outbound.database;

import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.entity.DebtEntity;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.repository.SpringDataDebtRepository;
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

    private final SpringDataDebtRepository debtRepository;
    private final MovementJpaRepository movementRepository;

    @Override
    public List<MovementJpaRepository.MonthlyTotal> sumIngresosMensuales(
            Integer userId, YearMonth inicio, YearMonth fin
    ) {
        return movementRepository.sumAmountMonthlyByUserIdAndDateBetweenAndType(
                userId, inicio.atDay(1), fin.atEndOfMonth(), "INGRESO"
        );
    }

    @Override
    public List<MovementJpaRepository.MonthlyTotal> sumGastosMensuales(
            Integer userId, YearMonth inicio, YearMonth fin
    ) {
        return movementRepository.sumAmountMonthlyByUserIdAndDateBetweenAndType(
                userId, inicio.atDay(1), fin.atEndOfMonth(), "GASTO"
        );
    }

    @Override
    public List<MovementJpaRepository.CategoryTotal> sumGastosPorCategoria(
            Integer userId, YearMonth inicio, YearMonth fin
    ) {
        return movementRepository.sumAmountByCategoryAndDateBetweenAndType(
                userId, inicio.atDay(1), fin.atEndOfMonth(), "GASTO"
        );
    }

    @Override
    public List<MonthlyDebt> sumDeudasMensuales(Integer userId, YearMonth inicio, YearMonth fin) {
        List<DebtEntity> deudas = debtRepository.findByUserId(userId);
        List<MonthlyDebt> resultado = new ArrayList<>();
        YearMonth cursor = inicio;
        while (!cursor.isAfter(fin)) {
            LocalDate inicioMes = cursor.atDay(1);
            LocalDate finMes = cursor.atEndOfMonth();
            BigDecimal total = deudas.stream()
                    .filter(d -> d.getStatus() != null && "ACTIVE".equalsIgnoreCase(d.getStatus().name()))
                    .filter(d -> estaActivaEnMes(d, inicioMes, finMes))
                    .map(d -> d.getMonthlyAmount() != null ? d.getMonthlyAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            resultado.add(new MonthlyDebt(cursor, total));
            cursor = cursor.plusMonths(1);
        }
        return resultado;
    }

    private boolean estaActivaEnMes(DebtEntity deuda, LocalDate inicioMes, LocalDate finMes) {
        boolean iniciaAntes = deuda.getStartDate() == null || !deuda.getStartDate().isAfter(finMes);
        boolean finalizaDespues = deuda.getEndDate() == null || !deuda.getEndDate().isBefore(inicioMes);
        return iniciaAntes && finalizaDespues;
    }
}
