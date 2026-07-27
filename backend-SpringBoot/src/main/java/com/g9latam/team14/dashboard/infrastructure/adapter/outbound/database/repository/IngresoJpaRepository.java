package com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository;

import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.entity.IngresoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IngresoJpaRepository extends JpaRepository<IngresoEntity, Integer> {

    List<IngresoEntity> findByIdUsuarioAndFechaIngresoBetween(
            @Param("idUsuario") Integer idUsuario,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("SELECT COALESCE(SUM(i.monto), 0) FROM IngresoEntity i WHERE i.idUsuario = :idUsuario AND i.fechaIngreso BETWEEN :start AND :end")
    BigDecimal sumMontoByIdUsuarioAndFechaIngresoBetween(
            @Param("idUsuario") Integer idUsuario,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}
