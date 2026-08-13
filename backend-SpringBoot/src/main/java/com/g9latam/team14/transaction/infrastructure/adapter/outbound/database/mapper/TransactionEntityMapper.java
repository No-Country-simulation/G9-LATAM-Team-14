package com.g9latam.team14.transaction.infrastructure.adapter.outbound.database.mapper;

import com.g9latam.team14.transaction.domain.model.ClassificationSource;
import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.model.TransactionDirection;
import com.g9latam.team14.transaction.domain.model.TransactionRegularity;
import com.g9latam.team14.transaction.domain.model.TransactionStatus;
import com.g9latam.team14.transaction.infrastructure.adapter.outbound.database.entity.TransactionEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TransactionEntityMapper {

    public Transaction toDomain(TransactionEntity entity) {

        return Transaction.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .financialProfileId(entity.getFinancialProfileId())

                .transactionDate(entity.getTransactionDate())
                .description(entity.getDescription())
                .note(entity.getNote())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())

                .direction(
                        entity.getDirection() != null
                                ? TransactionDirection.valueOf(
                                entity.getDirection().toUpperCase()
                        )
                                : null
                )

                .status(
                        entity.getStatus() != null
                                ? TransactionStatus.valueOf(
                                entity.getStatus().toUpperCase()
                        )
                                : null
                )

                .movementType(entity.getMovementType())

                // Datos del modelo
                .modelCategory(entity.getModelCategory())
                .modelPurpose(entity.getModelPurpose())
                .modelCategoryConfidencePercentage(
                        entity.getModelCategoryConfidencePercentage()
                )
                .modelPurposeConfidencePercentage(
                        entity.getModelPurposeConfidencePercentage()
                )
                .modelRegularity(entity.getModelRegularity())
                .modelRegularityConfidencePercentage(
                        entity.getModelRegularityConfidencePercentage()
                )
                .modelRequiresConfirmation(
                        entity.getModelRequiresConfirmation()
                )
                .modelConfirmationProbabilityPercentage(
                        entity.getModelConfirmationProbabilityPercentage()
                )
                .modelTopCategories(entity.getModelTopCategories())
                .modelCategoryPercentages(
                        entity.getModelCategoryPercentages()
                )
                .modelCategoryPurposePairValid(
                        entity.getModelCategoryPurposePairValid()
                )
                .modelRule(entity.getModelRule())
                .modelVersion(entity.getModelVersion())
                .modelResult(entity.getModelResult())

                // Datos actuales
                .currentCategories(entity.getCurrentCategories())
                .currentPurpose(entity.getCurrentPurpose())
                .currentRegularity(
                        entity.getCurrentRegularity() != null
                                ? TransactionRegularity.valueOf(
                                entity.getCurrentRegularity().toUpperCase()
                        )
                                : null
                )
                .classificationSource(
                        entity.getClassificationSource() != null
                                ? ClassificationSource.valueOf(
                                entity.getClassificationSource().toUpperCase()
                        )
                                : null
                )

                // Decisiones del usuario
                .firstUserDecision(entity.getFirstUserDecision())
                .decisionHistory(entity.getDecisionHistory())
                .firstDecidedAt(entity.getFirstDecidedAt())
                .lastCorrectedAt(entity.getLastCorrectedAt())
                .revisionCount(entity.getRevisionCount())

                // Fechas
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())

                .build();
    }

    public TransactionEntity toEntity(Transaction transaction) {

        TransactionEntity entity = new TransactionEntity();

        entity.setId(transaction.getId());
        entity.setUserId(transaction.getUserId());
        entity.setFinancialProfileId(transaction.getFinancialProfileId());

        entity.setTransactionDate(transaction.getTransactionDate());
        entity.setDescription(transaction.getDescription());
        entity.setNote(transaction.getNote());
        entity.setAmount(transaction.getAmount());
        entity.setCurrency(transaction.getCurrency());

        entity.setDirection(
                transaction.getDirection() != null
                        ? transaction.getDirection().getValue()
                        : null
        );

        entity.setStatus(
                transaction.getStatus() != null
                        ? transaction.getStatus().getValue()
                        : null
        );

        entity.setMovementType(transaction.getMovementType());

        // Datos del modelo
        entity.setModelCategory(transaction.getModelCategory());
        entity.setModelPurpose(transaction.getModelPurpose());
        entity.setModelCategoryConfidencePercentage(
                transaction.getModelCategoryConfidencePercentage()
        );
        entity.setModelPurposeConfidencePercentage(
                transaction.getModelPurposeConfidencePercentage()
        );
        entity.setModelRegularity(transaction.getModelRegularity());
        entity.setModelRegularityConfidencePercentage(
                transaction.getModelRegularityConfidencePercentage()
        );
        entity.setModelRequiresConfirmation(
                transaction.getModelRequiresConfirmation()
        );
        entity.setModelConfirmationProbabilityPercentage(
                transaction.getModelConfirmationProbabilityPercentage()
        );
        entity.setModelTopCategories(
                transaction.getModelTopCategories()
        );
        entity.setModelCategoryPercentages(
                transaction.getModelCategoryPercentages()
        );
        entity.setModelCategoryPurposePairValid(
                transaction.getModelCategoryPurposePairValid()
        );
        entity.setModelRule(transaction.getModelRule());
        entity.setModelVersion(transaction.getModelVersion());
        entity.setModelResult(transaction.getModelResult());

        // Datos actuales
        entity.setCurrentCategories(
                transaction.getCurrentCategories()
        );
        entity.setCurrentPurpose(
                transaction.getCurrentPurpose()
        );
        entity.setCurrentRegularity(
                transaction.getCurrentRegularity() != null
                        ? transaction.getCurrentRegularity().getValue()
                        : null
        );
        entity.setClassificationSource(
                transaction.getClassificationSource() != null
                        ? transaction.getClassificationSource().getValue()
                        : null
        );

        // Decisiones
        entity.setFirstUserDecision(
                transaction.getFirstUserDecision()
        );
        entity.setDecisionHistory(
                transaction.getDecisionHistory()
        );
        entity.setFirstDecidedAt(
                transaction.getFirstDecidedAt()
        );
        entity.setLastCorrectedAt(
                transaction.getLastCorrectedAt()
        );
        entity.setRevisionCount(
                transaction.getRevisionCount()
        );

        // Fechas
        entity.setCreatedAt(transaction.getCreatedAt());
        entity.setUpdatedAt(transaction.getUpdatedAt());

        return entity;
    }

    public List<Transaction> toDomainList(
            List<TransactionEntity> entities
    ) {
        return entities.stream()
                .map(this::toDomain)
                .toList();
    }
}