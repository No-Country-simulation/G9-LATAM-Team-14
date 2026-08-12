package com.g9latam.team14.transaction.domain.ports.inbound;

import com.g9latam.team14.transaction.domain.model.Transaction;

public interface ClassifyTransactionUseCase {

    Transaction classifyTransaction(Integer transactionId);
}