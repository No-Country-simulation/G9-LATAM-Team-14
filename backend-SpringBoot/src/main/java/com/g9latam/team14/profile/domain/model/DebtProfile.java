package com.g9latam.team14.profile.domain.model;
import java.math.BigDecimal;
public record DebtProfile(
    Integer id,
    String descripcion,
    BigDecimal monthlyAmount,
    Integer totalInstallments,
    Integer paidInstallments
) {}
