package com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos;
import com.g9latam.team14.debt.domain.model.DebtPaymentMode;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.model.DebtType;
import java.math.BigDecimal;
public record UpdateDebtRequest(
        DebtType type,
        String category,
        BigDecimal totalAmount,
        BigDecimal monthlyAmount,
        Integer monthsTerm,
        Integer paidInstallments,
        DebtPaymentMode paymentMode,
        String startDate,
        String endDate,
        Boolean isIndefinite,
        DebtStatus status
) {}
