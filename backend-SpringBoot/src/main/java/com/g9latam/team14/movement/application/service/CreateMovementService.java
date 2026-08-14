package com.g9latam.team14.movement.application.service;

import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.domain.ports.inbound.CreateMovementUseCase;
import com.g9latam.team14.movement.domain.ports.outbound.MovementRepositoryPort;
import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.model.TransactionDirection;
import com.g9latam.team14.transaction.domain.model.TransactionStatus;
import com.g9latam.team14.transaction.domain.ports.outbound.TransactionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CreateMovementService implements CreateMovementUseCase {
    private final MovementRepositoryPort movementRepository;
    private final TransactionRepositoryPort transactionRepository;
    private final com.g9latam.team14.movement.domain.ports.inbound.ClassifyMovementUseCase classifyMovementUseCase;

    @Override
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public Movement createMovement(Movement movement) {
        String category = movement.getCategory();
        if (category == null || category.isBlank() || "OTRO".equalsIgnoreCase(category) || "COMPRAS".equalsIgnoreCase(category)) {
            try {
                String direction = "INGRESO".equalsIgnoreCase(movement.getType()) ? "entrada" : "salida";
                var aiClass = classifyMovementUseCase.classifyMovement(
                        movement.getDescription(),
                        movement.getAmount() != null ? movement.getAmount().doubleValue() : 0.0,
                        direction,
                        ""
                );
                if (aiClass != null && aiClass.getCategory() != null && !aiClass.getCategory().isBlank()) {
                    category = aiClass.getCategory();
                }
            } catch (Exception e) {
                // Fallback to default
            }
        }
        if (category == null || category.isBlank()) {
            category = "INGRESO".equalsIgnoreCase(movement.getType()) ? "OTRO" : "COMPRAS";
        }


        Movement toSave = Movement.builder()
                .id(movement.getId())
                .description(movement.getDescription())
                .amount(movement.getAmount())
                .type(movement.getType())
                .category(category)
                .date(movement.getDate())
                .userId(movement.getUserId())
                .build();

        Movement saved = movementRepository.save(toSave);

        Transaction transaction = Transaction.builder()
                .id(null)
                .userId(saved.getUserId())
                .financialProfileId(null)
                .transactionDate(saved.getDate())
                .description(saved.getDescription())
                .note(null)
                .amount(saved.getAmount())
                .currency("COP")
                .direction(
                        "INGRESO".equalsIgnoreCase(saved.getType())
                                ? TransactionDirection.ENTRADA
                                : TransactionDirection.SALIDA
                )
                .status(TransactionStatus.PENDING_CLASSIFICATION)
                .movementType(null)
                .modelCategory(null)
                .modelPurpose(null)
                .modelCategoryConfidencePercentage(null)
                .modelPurposeConfidencePercentage(null)
                .modelRegularity(null)
                .modelRegularityConfidencePercentage(null)
                .modelRequiresConfirmation(true)
                .modelConfirmationProbabilityPercentage(null)
                .modelTopCategories(List.of())
                .modelCategoryPercentages(Map.of())
                .modelCategoryPurposePairValid(null)
                .modelRule(null)
                .modelVersion(null)
                .modelResult(Map.of())
                .currentCategories(List.of())
                .currentPurpose(null)
                .currentRegularity(null)
                .classificationSource(null)
                .firstUserDecision(Map.of())
                .decisionHistory(List.of())
                .firstDecidedAt(null)
                .lastCorrectedAt(null)
                .revisionCount(0)
                .build();

        transactionRepository.save(transaction);

        return saved;
    }

    @Override
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public Movement confirmMovement(Integer id, String category, String regularity, Integer debtId) {
        Movement existing = movementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado con id: " + id));

        Movement updated = Movement.builder()
                .id(existing.getId())
                .description(existing.getDescription())
                .amount(existing.getAmount())
                .type(existing.getType())
                .category(category != null && !category.isBlank() ? category : existing.getCategory())
                .date(existing.getDate())
                .userId(existing.getUserId())
                .build();

        return movementRepository.save(updated);
    }
}