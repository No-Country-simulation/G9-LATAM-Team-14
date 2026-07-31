package com.g9latam.team14.debt.infrastructure.adapter.outbound.database.repository;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.entity.DebtEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpringDataDebtRepository extends JpaRepository<DebtEntity, Integer> {
    List<DebtEntity> findByUserId(Integer userId);
    List<DebtEntity> findByUserIdAndStatus(Integer userId, DebtStatus status);
}
