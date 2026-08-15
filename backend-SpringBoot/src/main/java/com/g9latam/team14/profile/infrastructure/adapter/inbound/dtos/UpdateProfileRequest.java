package com.g9latam.team14.profile.infrastructure.adapter.inbound.dtos;
import java.math.BigDecimal;
import java.util.List;
public record UpdateProfileRequest(
    BigDecimal monthlyNetIncome,
    String primaryActivity,
    String primaryIncomeModality,
    String nextGoal,
    List<String> hobbies,
    String financialResponsibility,
    String savingHabit
) {}
