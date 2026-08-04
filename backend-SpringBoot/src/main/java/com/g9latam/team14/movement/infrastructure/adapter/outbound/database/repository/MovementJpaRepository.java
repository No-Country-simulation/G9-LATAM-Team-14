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

    interface MonthlyTotal {
        String getMes();
        BigDecimal getTotal();
    }

    @Query("SELECT FUNCTION('DATE_FORMAT', m.date, '%Y-%m') AS mes, COALESCE(SUM(m.amount), 0) AS total " +
            "FROM MovementEntity m " +
            "WHERE m.userId = :userId AND m.type = :type AND m.date BETWEEN :start AND :end " +
            "GROUP BY FUNCTION('DATE_FORMAT', m.date, '%Y-%m')")
    List<MonthlyTotal> sumAmountMonthlyByUserIdAndDateBetweenAndType(
            @Param("userId") Integer userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("type") String type
    );

    interface CategoryTotal {
        String getCategoria();
        BigDecimal getTotal();
    }

    @Query("SELECT m.category AS categoria, COALESCE(SUM(m.amount), 0) AS total " +
            "FROM MovementEntity m " +
            "WHERE m.userId = :userId AND m.type = :type AND m.date BETWEEN :start AND :end " +
            "GROUP BY m.category ORDER BY total DESC")
    List<CategoryTotal> sumAmountByCategoryAndDateBetweenAndType(
            @Param("userId") Integer userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("type") String type
    );
}