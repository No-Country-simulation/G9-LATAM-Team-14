package com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database;

import com.g9latam.team14.dashboard.domain.ports.outbound.DashboardRepositoryPort;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository.DeudaBancariaJpaRepository;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository.IngresoJpaRepository;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DashboardRepositoryAdapter implements DashboardRepositoryPort {

    private final IngresoJpaRepository ingresoRepository;
    private final DeudaBancariaJpaRepository deudaBancariaRepository;
    private final MovementJpaRepository movementRepository;

    @Override
    public BigDecimal sumIngresosByUserIdAndDates(Integer userId, LocalDate start, LocalDate end) {
        return ingresoRepository.sumMontoByIdUsuarioAndFechaIngresoBetween(userId, start, end);
    }

    @Override
    public BigDecimal sumGastosFijosByUserId(Integer userId) {
        return deudaBancariaRepository.sumMontoMensualByUsuario(userId);
    }

    @Override
    public BigDecimal sumGastosVariablesByUserIdAndDates(Integer userId, LocalDate start, LocalDate end) {
        return movementRepository.sumAmountByUserIdAndDateBetweenAndType(userId, start, end, "expense");
    }
}
