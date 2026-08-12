package com.g9latam.team14.transaction.domain.ports.outbound;

import com.g9latam.team14.transaction.domain.model.Transaction;

import java.util.List;
import java.util.Optional;

public interface TransactionRepositoryPort {

    Transaction save(Transaction transaction);

    Optional<Transaction> findById(Integer id);

    List<Transaction> findAll();

    List<Transaction> findByUserId(Integer userId);
}