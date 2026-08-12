package com.g9latam.team14.transaction.infrastructure.adapter.outbound.database.mapper;

import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.model.TransactionDirection;
import com.g9latam.team14.transaction.domain.model.TransactionStatus;
import com.g9latam.team14.transaction.infrastructure.adapter.inbound.dto.CreateTransactionRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class TransactionDtoMapper {

    public Transaction toDomain(
            CreateTransactionRequest request,
            Integer userId
    ) {
        return Transaction.builder()
                .id(null)
                .userId(userId)
                .financialProfileId(null)

                .transactionDate(request.transactionDate())
                .description(request.description())
                .note(request.note())
                .amount(request.amount())
                .currency("COP")

                .direction(
                        TransactionDirection.valueOf(
                                request.direction().toUpperCase()
                        )
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
    }
}