package com.g9latam.team14.transaction.application.service;

import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.ports.inbound.ClassifyTransactionUseCase;
import com.g9latam.team14.transaction.domain.ports.outbound.AiServicePort;
import com.g9latam.team14.transaction.domain.ports.outbound.TransactionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassifyTransactionService implements ClassifyTransactionUseCase {

    private final TransactionRepositoryPort transactionRepository;
    private final AiServicePort aiService;

    @Override
    public Transaction classifyTransaction(Integer transactionId) {

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Transacción no encontrada con id: " + transactionId
                        )
                );

        Transaction classified = aiService.classifyTransaction(transaction);

        return transactionRepository.save(classified);
    }
}