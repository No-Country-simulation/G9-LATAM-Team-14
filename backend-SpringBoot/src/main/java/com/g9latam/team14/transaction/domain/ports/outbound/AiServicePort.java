package com.g9latam.team14.transaction.domain.ports.outbound;

import com.g9latam.team14.transaction.domain.model.Transaction;

public interface AiServicePort {

    Transaction classifyTransaction(Transaction transaction);
}