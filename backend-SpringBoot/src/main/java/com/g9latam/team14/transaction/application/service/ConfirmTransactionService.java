package com.g9latam.team14.transaction.application.service;

import com.g9latam.team14.transaction.domain.model.CategoryPercentage;
import com.g9latam.team14.transaction.domain.model.ClassificationSource;
import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.model.TransactionRegularity;
import com.g9latam.team14.transaction.domain.model.TransactionStatus;
import com.g9latam.team14.transaction.domain.ports.inbound.ConfirmTransactionUseCase;
import com.g9latam.team14.transaction.domain.ports.outbound.TransactionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConfirmTransactionService implements ConfirmTransactionUseCase {

    private final TransactionRepositoryPort transactionRepository;

    @Override
    public Transaction confirmTransaction(
            Integer transactionId,
            String category,
            String purpose,
            String regularity
    ) {

        Transaction existing = transactionRepository.findById(transactionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Transacción no encontrada con id: " + transactionId
                        )
                );

        /*
         * Valores finales que quedarán registrados.
         */
        String finalCategory =
                category != null && !category.isBlank()
                        ? category.trim()
                        : existing.getModelCategory();

        String finalPurpose =
                purpose != null && !purpose.isBlank()
                        ? purpose.trim()
                        : existing.getModelPurpose();

        TransactionRegularity finalRegularity =
                regularity != null && !regularity.isBlank()
                        ? parseRegularity(regularity)
                        : parseRegularity(existing.getModelRegularity());

        /*
         * Determinamos si el usuario confirmó exactamente
         * lo que propuso el modelo.
         */
        boolean categoryConfirmed =
                equalsIgnoreCase(
                        finalCategory,
                        existing.getModelCategory()
                );

        boolean purposeConfirmed =
                equalsIgnoreCase(
                        finalPurpose,
                        existing.getModelPurpose()
                );

        boolean regularityConfirmed =
                finalRegularity != null
                        && equalsIgnoreCase(
                        finalRegularity.getValue(),
                        existing.getModelRegularity()
                );

        boolean modelConfirmed =
                categoryConfirmed
                        && purposeConfirmed
                        && regularityConfirmed;

        ClassificationSource source =
                modelConfirmed
                        ? ClassificationSource.MODEL_CONFIRMED
                        : ClassificationSource.USER_CORRECTION;

        LocalDateTime now = LocalDateTime.now();

        /*
         * Categoría actualmente seleccionada por el usuario.
         */
        List<CategoryPercentage> currentCategories =
                new ArrayList<>();

        if (finalCategory != null && !finalCategory.isBlank()) {

            BigDecimal percentage =
                    existing.getModelCategoryConfidencePercentage() != null
                            ? existing.getModelCategoryConfidencePercentage()
                            : BigDecimal.ZERO;

            currentCategories.add(
                    CategoryPercentage.builder()
                            .category(finalCategory)
                            .percentage(percentage)
                            .build()
            );
        }

        /*
         * Decisión actual del usuario.
         */
        Map<String, Object> decision = Map.of(
                "category",
                finalCategory != null ? finalCategory : "",

                "purpose",
                finalPurpose != null ? finalPurpose : "",

                "regularity",
                finalRegularity != null
                        ? finalRegularity.getValue()
                        : ""
        );

        /*
         * Historial de decisiones.
         */
        List<Map<String, Object>> decisionHistory =
                existing.getDecisionHistory() != null
                        ? new ArrayList<>(existing.getDecisionHistory())
                        : new ArrayList<>();

        decisionHistory.add(decision);

        /*
         * Número de revisiones.
         */
        int revisionCount =
                existing.getRevisionCount() != null
                        ? existing.getRevisionCount() + 1
                        : 1;

        /*
         * Construimos la transacción confirmada,
         * conservando todos los datos existentes.
         */
        Transaction confirmed = Transaction.builder()

                // Datos básicos
                .id(existing.getId())
                .userId(existing.getUserId())
                .financialProfileId(existing.getFinancialProfileId())
                .transactionDate(existing.getTransactionDate())
                .description(existing.getDescription())
                .note(existing.getNote())
                .amount(existing.getAmount())
                .currency(existing.getCurrency())
                .direction(existing.getDirection())

                // Estado
                .status(TransactionStatus.CONFIRMED)

                // Datos del modelo
                .movementType(existing.getMovementType())
                .modelCategory(existing.getModelCategory())
                .modelPurpose(existing.getModelPurpose())
                .modelCategoryConfidencePercentage(
                        existing.getModelCategoryConfidencePercentage()
                )
                .modelPurposeConfidencePercentage(
                        existing.getModelPurposeConfidencePercentage()
                )
                .modelRegularity(existing.getModelRegularity())
                .modelRegularityConfidencePercentage(
                        existing.getModelRegularityConfidencePercentage()
                )
                .modelRequiresConfirmation(false)
                .modelConfirmationProbabilityPercentage(
                        existing.getModelConfirmationProbabilityPercentage()
                )
                .modelTopCategories(
                        existing.getModelTopCategories()
                )
                .modelCategoryPercentages(
                        existing.getModelCategoryPercentages()
                )
                .modelCategoryPurposePairValid(
                        existing.getModelCategoryPurposePairValid()
                )
                .modelRule(existing.getModelRule())
                .modelVersion(existing.getModelVersion())
                .modelResult(existing.getModelResult())

                // Clasificación actual
                .currentCategories(currentCategories)
                .currentPurpose(finalPurpose)
                .currentRegularity(finalRegularity)
                .classificationSource(source)

                // Decisiones del usuario
                .firstUserDecision(
                        existing.getFirstUserDecision() != null
                                ? existing.getFirstUserDecision()
                                : decision
                )
                .decisionHistory(decisionHistory)

                .firstDecidedAt(
                        existing.getFirstDecidedAt() != null
                                ? existing.getFirstDecidedAt()
                                : now
                )

                .lastCorrectedAt(
                        source == ClassificationSource.USER_CORRECTION
                                ? now
                                : existing.getLastCorrectedAt()
                )

                .revisionCount(revisionCount)

                // Fechas
                .createdAt(existing.getCreatedAt())
                .updatedAt(now)

                .build();

        return transactionRepository.save(confirmed);
    }

    private boolean equalsIgnoreCase(
            String first,
            String second
    ) {

        if (first == null || second == null) {
            return first == null && second == null;
        }

        return first.equalsIgnoreCase(second);
    }

    private TransactionRegularity parseRegularity(
            String regularity
    ) {

        if (regularity == null || regularity.isBlank()) {
            return null;
        }

        try {

            return TransactionRegularity.valueOf(
                    regularity.trim().toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            throw new IllegalArgumentException(
                    "Regularidad no válida: " + regularity
            );
        }
    }
}