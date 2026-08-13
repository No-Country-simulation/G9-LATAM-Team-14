package com.g9latam.team14.transaction.application.service;

import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.ports.inbound.CreateTransactionUseCase;
import com.g9latam.team14.transaction.domain.ports.outbound.TransactionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateTransactionService implements CreateTransactionUseCase {

    private final TransactionRepositoryPort transactionRepository;

    @Override
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }
}