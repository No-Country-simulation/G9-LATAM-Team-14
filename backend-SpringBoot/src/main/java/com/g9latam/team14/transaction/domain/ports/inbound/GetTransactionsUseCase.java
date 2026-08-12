package com.g9latam.team14.transaction.domain.ports.inbound;

import com.g9latam.team14.transaction.domain.model.Transaction;

import java.util.List;

public interface GetTransactionsUseCase {

    List<Transaction> getTransactionsByUser(Integer userId);
}