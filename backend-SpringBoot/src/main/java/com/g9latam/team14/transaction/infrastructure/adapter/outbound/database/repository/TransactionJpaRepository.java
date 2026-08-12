package com.g9latam.team14.transaction.infrastructure.adapter.outbound.database.repository;
import java.util.List;
import com.g9latam.team14.transaction.infrastructure.adapter.outbound.database.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionJpaRepository
        extends JpaRepository<TransactionEntity, Integer> {
    List<TransactionEntity> findByUserId(Integer userId);
}