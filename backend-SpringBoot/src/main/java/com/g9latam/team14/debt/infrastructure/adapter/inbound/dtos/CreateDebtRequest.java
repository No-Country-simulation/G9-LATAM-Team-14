package com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos;
import com.g9latam.team14.debt.domain.model.DebtPaymentMode;
import com.g9latam.team14.debt.domain.model.DebtType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
public record CreateDebtRequest(
        @NotNull DebtType type,
        @NotBlank String category,
        BigDecimal totalAmount,
        @NotNull @Positive BigDecimal monthlyAmount,
        Integer monthsTerm,
        DebtPaymentMode paymentMode,
        String startDate,
        String endDate,
        Boolean isIndefinite,
        @NotNull Integer userId
) {}
