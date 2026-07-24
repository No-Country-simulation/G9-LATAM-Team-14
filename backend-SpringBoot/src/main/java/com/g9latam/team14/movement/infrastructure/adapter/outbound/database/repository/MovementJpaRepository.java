package com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository;

import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.entity.MovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovementJpaRepository
        extends JpaRepository<MovementEntity, Integer> {

}