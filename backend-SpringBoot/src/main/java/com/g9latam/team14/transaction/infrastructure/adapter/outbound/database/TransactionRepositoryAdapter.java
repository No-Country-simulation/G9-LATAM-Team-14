package com.g9latam.team14.transaction.infrastructure.adapter.outbound.database;

import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.ports.outbound.TransactionRepositoryPort;
import com.g9latam.team14.transaction.infrastructure.adapter.outbound.database.mapper.TransactionEntityMapper;
import com.g9latam.team14.transaction.infrastructure.adapter.outbound.database.repository.TransactionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TransactionRepositoryAdapter implements TransactionRepositoryPort {

    private final TransactionJpaRepository transactionJpaRepository;
    private final TransactionEntityMapper transactionEntityMapper;

    @Override
    public Transaction save(Transaction transaction) {
        var savedEntity = transactionJpaRepository.save(
                transactionEntityMapper.toEntity(transaction)
        );

        return transactionEntityMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Transaction> findById(Integer id) {
        return transactionJpaRepository.findById(id)
                .map(transactionEntityMapper::toDomain);
    }

    @Override
    public List<Transaction> findAll() {
        return transactionEntityMapper.toDomainList(
                transactionJpaRepository.findAll()
        );
    }

    @Override
    public List<Transaction> findByUserId(Integer userId) {
        return transactionEntityMapper.toDomainList(
                transactionJpaRepository.findByUserId(userId)
        );
    }

}