package com.g9latam.team14.transaction.application.service;

import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.ports.inbound.GetTransactionsUseCase;
import com.g9latam.team14.transaction.domain.ports.outbound.TransactionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetTransactionsService implements GetTransactionsUseCase {

    private final TransactionRepositoryPort transactionRepository;

    @Override
    public List<Transaction> getTransactionsByUser(Integer userId) {
        return transactionRepository.findByUserId(userId);
    }
}