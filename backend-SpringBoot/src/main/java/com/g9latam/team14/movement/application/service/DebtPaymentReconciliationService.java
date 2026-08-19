package com.g9latam.team14.movement.application.service;

import com.g9latam.team14.debt.domain.service.DebtFinancialCalculator;
import com.g9latam.team14.debt.domain.ports.inbound.ApplyDebtPaymentUseCase;
import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.inbound.CreateMovementUseCase;
import com.g9latam.team14.movement.domain.ports.outbound.MovementRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DebtPaymentReconciliationService {
    private final MovementRepositoryPort movementRepository;
    private final CreateMovementUseCase createMovementUseCase;
    private final ApplyDebtPaymentUseCase applyDebtPaymentUseCase;

    @EventListener(ApplicationReadyEvent.class)
    public void linkExistingDebtPayments() {
        for (Movement movement : movementRepository.findAll()) {
            Movement movementToReview = removeIncorrectLink(movement);
            if (!isPendingDebtPayment(movementToReview)) {
                continue;
            }
            try {
                createMovementUseCase.confirmMovement(
                        movementToReview.getId(),
                        movementToReview.getCategory(),
                        movementToReview.getRegularity(),
                        movementToReview.getDebtId()
                );
                log.info("Debt payment movement {} was linked automatically.", movementToReview.getId());
            } catch (RuntimeException exception) {
                log.warn("Debt payment movement {} could not be linked: {}", movementToReview.getId(), exception.getMessage());
            }
        }
    }

    private Movement removeIncorrectLink(Movement movement) {
        if (!Boolean.TRUE.equals(movement.getDebtPaymentApplied()) || movement.getDebtId() == null) {
            return movement;
        }
        String context = String.join(" ",
                movement.getDescription() != null ? movement.getDescription() : "",
                movement.getNote() != null ? movement.getNote() : ""
        );
        if (applyDebtPaymentUseCase.paymentMatchesDebt(
                movement.getUserId(), movement.getDebtId(), context)) {
            return movement;
        }

        applyDebtPaymentUseCase.reversePayment(
                movement.getUserId(), movement.getDebtId(), movement.getAmount());
        Movement cleaned = Movement.builder()
                .id(movement.getId())
                .description(movement.getDescription())
                .amount(movement.getAmount())
                .type(movement.getType())
                .category(movement.getCategory())
                .regularity(movement.getRegularity())
                .date(movement.getDate())
                .note(movement.getNote())
                .userId(movement.getUserId())
                .debtId(null)
                .debtPaymentApplied(false)
                .build();
        log.warn("Incorrect debt link on movement {} was reverted.", movement.getId());
        return movementRepository.save(cleaned);
    }

    private boolean isPendingDebtPayment(Movement movement) {
        String category = DebtFinancialCalculator.normalize(movement.getCategory());
        return "GASTO".equalsIgnoreCase(movement.getType())
                && category.contains("deuda")
                && category.contains("financiacion")
                && !Boolean.TRUE.equals(movement.getDebtPaymentApplied());
    }
}
