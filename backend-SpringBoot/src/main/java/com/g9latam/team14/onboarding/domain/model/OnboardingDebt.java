package com.g9latam.team14.onboarding.domain.model;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OnboardingDebt {
    private final String category;
    private final Double amount;
}
