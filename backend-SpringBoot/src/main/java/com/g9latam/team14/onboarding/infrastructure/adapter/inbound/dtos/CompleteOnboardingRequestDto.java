package com.g9latam.team14.onboarding.infrastructure.adapter.inbound.dtos;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CompleteOnboardingRequestDto(
        @NotNull Double monthlyNetIncome,
        String primaryActivity,
        String primaryIncomeModality,
        String nextGoal,
        List<OnboardingDebtItemDto> debts,
        List<String> hobbies,
        String financialResponsibility,
        String savingHabit,
        Integer userId
) {
    public record OnboardingDebtItemDto(
            String category,
            Double amount
    ) {}
}
