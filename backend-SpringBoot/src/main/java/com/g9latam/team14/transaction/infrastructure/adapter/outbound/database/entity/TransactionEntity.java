package com.g9latam.team14.transaction.infrastructure.adapter.outbound.database.entity;

import com.g9latam.team14.transaction.domain.model.CategoryPercentage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "financial_profile_id")
    private Integer financialProfileId;

    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    @Column(name = "description")
    private String description;

    @Column(name = "note")
    private String note;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "currency")
    private String currency;

    @Column(name = "direction")
    private String direction;

    @Column(name = "status")
    private String status;

    @Column(name = "movement_type")
    private String movementType;

    @Column(name = "model_category")
    private String modelCategory;

    @Column(name = "model_purpose")
    private String modelPurpose;

    @Column(name = "model_category_confidence_percentage")
    private BigDecimal modelCategoryConfidencePercentage;

    @Column(name = "model_purpose_confidence_percentage")
    private BigDecimal modelPurposeConfidencePercentage;

    @Column(name = "model_regularity")
    private String modelRegularity;

    @Column(name = "model_regularity_confidence_percentage")
    private BigDecimal modelRegularityConfidencePercentage;

    @Column(name = "model_requires_confirmation")
    private Boolean modelRequiresConfirmation;

    @Column(name = "model_confirmation_probability_percentage")
    private BigDecimal modelConfirmationProbabilityPercentage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "model_top_categories", columnDefinition = "json")
    private List<CategoryPercentage> modelTopCategories;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "model_category_percentages", columnDefinition = "json")
    private Map<String, BigDecimal> modelCategoryPercentages;

    @Column(name = "model_category_purpose_pair_valid")
    private Boolean modelCategoryPurposePairValid;

    @Column(name = "model_rule")
    private String modelRule;

    @Column(name = "model_version")
    private String modelVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "model_result", columnDefinition = "json")
    private Map<String, Object> modelResult;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "current_categories", columnDefinition = "json")
    private List<CategoryPercentage> currentCategories;

    @Column(name = "current_purpose")
    private String currentPurpose;

    @Column(name = "current_regularity")
    private String currentRegularity;

    @Column(name = "classification_source")
    private String classificationSource;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "first_user_decision", columnDefinition = "json")
    private Map<String, Object> firstUserDecision;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "decision_history", columnDefinition = "json")
    private List<Map<String, Object>> decisionHistory;

    @Column(name = "first_decided_at")
    private LocalDateTime firstDecidedAt;

    @Column(name = "last_corrected_at")
    private LocalDateTime lastCorrectedAt;

    @Column(name = "revision_count")
    private Integer revisionCount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}