package com.g9latam.team14.perfilfinanciero.infrastructure.adapter.outbound.database;

import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface PerfilJpaRepository extends JpaRepository<UserEntity, Integer> {

    @Query("SELECT u.ingresoMensual FROM UserEntity u WHERE u.id = :userId")
    BigDecimal findIngresoMensualById(@Param("userId") Integer userId);

    @Query("SELECT u.frecuenciaAhorro FROM UserEntity u WHERE u.id = :userId")
    String findFrecuenciaAhorroById(@Param("userId") Integer userId);

    @Modifying
    @Query("UPDATE UserEntity u SET u.ingresoMensual = :ingreso WHERE u.id = :userId")
    void updateIngresoMensual(@Param("userId") Integer userId, @Param("ingreso") BigDecimal ingreso);

    @Modifying
    @Query("UPDATE UserEntity u SET u.frecuenciaAhorro = :frecuencia WHERE u.id = :userId")
    void updateFrecuenciaAhorro(@Param("userId") Integer userId, @Param("frecuencia") String frecuencia);
}
