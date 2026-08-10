package com.g9latam.team14.perfilfinanciero.domain.model;

import java.math.BigDecimal;

public record DebtProfile(
        Integer id,
        String category,
        BigDecimal monthlyAmount,
        Integer monthsTerm,
        Integer paidInstallments
) {
}
