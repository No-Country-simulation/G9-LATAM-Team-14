package com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos;
import java.math.BigDecimal;
public record DebtSummaryResponse(
        BigDecimal totalPendingAmount,
        BigDecimal totalMonthlyPayment,
        Double incomePercentage,
        String estimatedFreeDate,
        Integer monthsRemaining
) {}
