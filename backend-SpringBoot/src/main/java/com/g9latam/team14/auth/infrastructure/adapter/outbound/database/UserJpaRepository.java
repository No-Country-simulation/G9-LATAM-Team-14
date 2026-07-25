package com.g9latam.team14.auth.infrastructure.adapter.outbound.database;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserJpaRepository extends JpaRepository<UserEntity, Integer> {
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}
