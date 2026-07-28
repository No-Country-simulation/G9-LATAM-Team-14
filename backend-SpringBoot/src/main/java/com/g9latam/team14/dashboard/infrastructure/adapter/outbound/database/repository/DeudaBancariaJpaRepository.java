package com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.repository;

import com.g9latam.team14.dashboard.infrastructure.adapter.outbound.database.entity.DeudaBancariaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface DeudaBancariaJpaRepository extends JpaRepository<DeudaBancariaEntity, Integer> {

    List<DeudaBancariaEntity> findByUsuario(@Param("usuario") Integer usuario);

    @Query("SELECT COALESCE(SUM(d.montoMensual), 0) FROM DeudaBancariaEntity d WHERE d.usuario = :usuario")
    BigDecimal sumMontoMensualByUsuario(@Param("usuario") Integer usuario);
}
