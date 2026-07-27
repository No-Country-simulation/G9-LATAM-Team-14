package com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository;

import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.entity.MovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface MovementJpaRepository
        extends JpaRepository<MovementEntity, Integer> {

    List<MovementEntity> findByUserIdAndDateBetween(
            @Param("userId") Integer userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("SELECT COALESCE(SUM(m.amount), 0) FROM MovementEntity m WHERE m.userId = :userId AND m.date BETWEEN :start AND :end AND m.type = :type")
    BigDecimal sumAmountByUserIdAndDateBetweenAndType(
            @Param("userId") Integer userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("type") String type
    );
}