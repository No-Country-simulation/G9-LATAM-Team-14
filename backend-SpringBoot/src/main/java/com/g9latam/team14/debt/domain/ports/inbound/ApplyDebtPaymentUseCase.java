package com.g9latam.team14.debt.domain.ports.inbound;

import com.g9latam.team14.debt.domain.model.Debt;

import java.math.BigDecimal;

public interface ApplyDebtPaymentUseCase {
    Debt applyPayment(Integer userId, BigDecimal amount, String description, Integer requestedDebtId);
    void reversePayment(Integer userId, Integer debtId, BigDecimal amount);
    boolean paymentMatchesDebt(Integer userId, Integer debtId, String description);
}
