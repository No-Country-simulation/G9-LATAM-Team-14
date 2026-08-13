package com.g9latam.team14.onboarding.domain.ports.outbound;
import com.g9latam.team14.onboarding.domain.model.OnboardingData;
public interface DsProfilePort {
    void syncProfile(OnboardingData data);
}
