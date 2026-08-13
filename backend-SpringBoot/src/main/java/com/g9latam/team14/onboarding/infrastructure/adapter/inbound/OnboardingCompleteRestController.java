package com.g9latam.team14.onboarding.infrastructure.adapter.inbound;

import com.g9latam.team14.onboarding.domain.model.OnboardingData;
import com.g9latam.team14.onboarding.domain.model.OnboardingDebt;
import com.g9latam.team14.onboarding.domain.ports.inbound.CompleteOnboardingUseCase;
import com.g9latam.team14.onboarding.infrastructure.adapter.inbound.dtos.CompleteOnboardingRequestDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/onboarding/complete")
@RequiredArgsConstructor
public class OnboardingCompleteRestController {

    private final CompleteOnboardingUseCase completeOnboardingUseCase;

    @PostMapping
    public ResponseEntity<Map<String, Object>> completeOnboarding(@Valid @RequestBody CompleteOnboardingRequestDto request) {
        Integer userId = request.userId() != null ? request.userId() : 1;

        List<OnboardingDebt> debts = request.debts() == null ? List.of() :
                request.debts().stream()
                        .map(d -> OnboardingDebt.builder()
                                .category(d.category())
                                .amount(d.amount())
                                .build())
                        .toList();

        OnboardingData data = OnboardingData.builder()
                .userId(userId)
                .monthlyNetIncome(request.monthlyNetIncome())
                .primaryActivity(request.primaryActivity())
                .primaryIncomeModality(request.primaryIncomeModality())
                .nextGoal(request.nextGoal())
                .debts(debts)
                .hobbies(request.hobbies() != null ? request.hobbies() : List.of())
                .financialResponsibility(request.financialResponsibility() != null ? request.financialResponsibility() : "")
                .savingHabit(request.savingHabit() != null ? request.savingHabit() : "media")
                .build();

        completeOnboardingUseCase.completeOnboarding(data);

        return ResponseEntity.ok(Map.of(
                "message", "Onboarding completado exitosamente",
                "userId", userId,
                "onboardingCompleted", true
        ));
    }
}
