package com.g9latam.team14.transaction.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class Transaction {

    private final Integer id;
    private final Integer userId;
    private final Integer financialProfileId;

    private final LocalDate transactionDate;
    private final String description;
    private final String note;

    private final BigDecimal amount;
    private final String currency;

    private final TransactionDirection direction;
    private final TransactionStatus status;
    private final String movementType;

    private final String modelCategory;
    private final String modelPurpose;

    private final BigDecimal modelCategoryConfidencePercentage;
    private final BigDecimal modelPurposeConfidencePercentage;

    private final String modelRegularity;
    private final BigDecimal modelRegularityConfidencePercentage;

    private final Boolean modelRequiresConfirmation;
    private final BigDecimal modelConfirmationProbabilityPercentage;
    private final List<CategoryPercentage> modelTopCategories;
    private final Map<String, BigDecimal> modelCategoryPercentages;

    private final Boolean modelCategoryPurposePairValid;

    private final String modelRule;
    private final String modelVersion;
    private final Map<String, Object> modelResult;

    private final List<CategoryPercentage> currentCategories;
    private final String currentPurpose;
    private final TransactionRegularity currentRegularity;
    private final ClassificationSource classificationSource;
    private final Map<String, Object> firstUserDecision;
    private final List<Map<String, Object>> decisionHistory;

    private final LocalDateTime firstDecidedAt;
    private final LocalDateTime lastCorrectedAt;

    private final Integer revisionCount;

    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}