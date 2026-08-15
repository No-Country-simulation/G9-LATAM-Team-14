package com.g9latam.team14.profile.infrastructure.adapter.outbound.database;

import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserJpaRepository;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.entity.DeudaBancariaEntity;
import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository.DeudaBancariaJpaRepository;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.entity.MovementEntity;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import com.g9latam.team14.profile.domain.model.DebtProfile;
import com.g9latam.team14.profile.domain.ports.outbound.PerfilFinancieroRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PerfilFinancieroAdapter implements PerfilFinancieroRepositoryPort {

    private final UserJpaRepository userJpaRepository;
    private final DeudaBancariaJpaRepository deudaBancariaJpaRepository;
    private final MovementJpaRepository movementJpaRepository;

    @Override
    public BigDecimal getIngresoMensual(Integer userId) {
        return userJpaRepository.findById(userId)
                .map(UserEntity::getIngresoMensual)
                .map(Float::doubleValue)
                .map(BigDecimal::valueOf)
                .orElse(BigDecimal.ZERO);
    }

    @Override
    public void updateIngresoMensual(Integer userId, BigDecimal ingresoMensual) {
        userJpaRepository.findById(userId).ifPresent(user -> {
            user.setIngresoMensual(ingresoMensual != null ? ingresoMensual.floatValue() : 0.0f);
            userJpaRepository.save(user);
        });
    }

    @Override
    public String getFrecuenciaAhorro(Integer userId) {
        return userJpaRepository.findById(userId)
                .map(UserEntity::getFrecuenciaAhorro)
                .orElse("MEDIA");
    }

    @Override
    public void updateFrecuenciaAhorro(Integer userId, String frecuenciaAhorro) {
        userJpaRepository.findById(userId).ifPresent(user -> {
            user.setFrecuenciaAhorro(frecuenciaAhorro);
            userJpaRepository.save(user);
        });
    }

    @Override
    public BigDecimal promedioGastosMensuales(Integer userId, int meses) {
        LocalDate desde = LocalDate.now().minusMonths(meses);
        LocalDate hasta = LocalDate.now();
        List<MovementEntity> movements = movementJpaRepository.findByUserIdAndDateBetween(userId, desde, hasta);

        if (movements.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal total = movements.stream()
                .filter(m -> "EXPENSE".equalsIgnoreCase(m.getType()) || "GASTO".equalsIgnoreCase(m.getType()) || "EGRESO".equalsIgnoreCase(m.getType()))
                .filter(m -> m.getAmount() != null)
                .map(MovementEntity::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return total.divide(BigDecimal.valueOf(meses), 2, RoundingMode.HALF_UP);
    }

    @Override
    public List<DebtProfile> getDeudasLegacy(Integer userId) {
        return deudaBancariaJpaRepository.findByUsuario(userId).stream()
                .map(this::toDebtProfile)
                .toList();
    }

    private DebtProfile toDebtProfile(DeudaBancariaEntity entity) {
        BigDecimal monto = entity.getMontoMensual() != null
                ? entity.getMontoMensual()
                : BigDecimal.ZERO;
        return new DebtProfile(
                entity.getId(),
                entity.getDescripcion(),
                monto,
                null,
                null
        );
    }
}
