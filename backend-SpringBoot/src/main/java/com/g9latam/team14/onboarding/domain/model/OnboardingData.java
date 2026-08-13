package com.g9latam.team14.onboarding.domain.model;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class OnboardingData {
    private final Integer userId;
    private final Double monthlyNetIncome;
    private final String primaryActivity;
    private final String primaryIncomeModality;
    private final String nextGoal;
    private final List<OnboardingDebt> debts;
    private final List<String> hobbies;
    private final String financialResponsibility;
    private final String savingHabit;
}
