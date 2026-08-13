package com.g9latam.team14.onboarding.domain.ports.inbound;
import com.g9latam.team14.onboarding.domain.model.OnboardingData;

public interface CompleteOnboardingUseCase {
    void completeOnboarding(OnboardingData data);
}
