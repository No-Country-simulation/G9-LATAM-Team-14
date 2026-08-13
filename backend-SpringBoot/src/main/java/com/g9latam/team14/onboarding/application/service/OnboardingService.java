package com.g9latam.team14.onboarding.application.service;

import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserJpaRepository;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.ports.inbound.CreateBatchDebtsUseCase;
import com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos.CreateBatchDebtsRequest;
import com.g9latam.team14.debt.infrastructure.adapter.inbound.mapper.DebtDtoMapper;
import com.g9latam.team14.onboarding.domain.model.OnboardingData;
import com.g9latam.team14.onboarding.domain.ports.inbound.CompleteOnboardingUseCase;
import com.g9latam.team14.onboarding.domain.ports.outbound.DsProfilePort;
import com.g9latam.team14.perfilfinanciero.domain.ports.inbound.UpdatePerfilFinancieroUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnboardingService implements CompleteOnboardingUseCase {
    private final UpdatePerfilFinancieroUseCase updatePerfilFinancieroUseCase;
    private final CreateBatchDebtsUseCase createBatchDebtsUseCase;
    private final DebtDtoMapper debtDtoMapper;
    private final UserJpaRepository userJpaRepository;
    private final DsProfilePort dsProfilePort;

    @Override
    public void completeOnboarding(OnboardingData data) {
        Integer userId = data.getUserId();
        if (data.getMonthlyNetIncome() != null && data.getMonthlyNetIncome() > 0) {
            updatePerfilFinancieroUseCase.updateIngresoMensual(
                    userId,
                    BigDecimal.valueOf(data.getMonthlyNetIncome())
            );
        }
        if (data.getDebts() != null && !data.getDebts().isEmpty()) {
            List<CreateBatchDebtsRequest.SingleDebtItemRequest> batchItems = data.getDebts().stream()
                    .map(d -> new CreateBatchDebtsRequest.SingleDebtItemRequest("INSTALLMENT", d.getCategory(), d.getAmount()))
                    .toList();
            CreateBatchDebtsRequest batchRequest = new CreateBatchDebtsRequest(userId, batchItems);
            List<Debt> domainDebts = debtDtoMapper.toDomainBatchList(batchRequest);
            createBatchDebtsUseCase.createBatchDebts(domainDebts, userId);
        }
        Optional<UserEntity> userOpt = userJpaRepository.findById(userId);
        userOpt.ifPresent(user -> {
            user.setOnboardingCompleted(true);
            userJpaRepository.save(user);
        });
        try {
            dsProfilePort.syncProfile(data);
        } catch (Exception e) {
            log.warn("[Onboarding] Perfil no sincronizado con Data Science para userId={}: {}", userId, e.getMessage());
        }
    }
}
