package com.g9latam.team14.recommendation.infrastructure.adapter.outbound.database.repository;

import com.g9latam.team14.recommendation.infrastructure.adapter.outbound.database.entity.RecomendacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RecomendacionJpaRepository
        extends JpaRepository<RecomendacionEntity, Integer> {

    List<RecomendacionEntity> findByUserIdAndDateBetween(
            @Param("userId") Integer userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    Optional<RecomendacionEntity> findByIdAndUserId(
            @Param("id") Integer id,
            @Param("userId") Integer userId
    );
}
