package com.g9latam.team14.profile.infrastructure.adapter.outbound.database;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PerfilJpaRepository extends JpaRepository<UserEntity, Integer> {
}
