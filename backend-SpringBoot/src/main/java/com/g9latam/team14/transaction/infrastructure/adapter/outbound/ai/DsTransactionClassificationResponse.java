package com.g9latam.team14.transaction.infrastructure.adapter.outbound.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

public record DsTransactionClassificationResponse(

        @JsonProperty("movement_type")
        String movementType,

        @JsonProperty("model_category")
        String modelCategory,

        @JsonProperty("model_purpose")
        String modelPurpose,

        @JsonProperty("model_category_confidence_percentage")
        Double modelCategoryConfidencePercentage,

        @JsonProperty("model_purpose_confidence_percentage")
        Double modelPurposeConfidencePercentage,

        @JsonProperty("model_regularity")
        String modelRegularity,

        @JsonProperty("model_regularity_confidence_percentage")
        Double modelRegularityConfidencePercentage,

        @JsonProperty("model_requires_confirmation")
        Boolean modelRequiresConfirmation,

        @JsonProperty("model_confirmation_probability_percentage")
        Double modelConfirmationProbabilityPercentage,

        @JsonProperty("model_top_categories")
        JsonNode modelTopCategories,

        @JsonProperty("model_category_percentages")
        JsonNode modelCategoryPercentages,

        @JsonProperty("model_category_purpose_pair_valid")
        Boolean modelCategoryPurposePairValid,

        @JsonProperty("model_rule")
        String modelRule,

        @JsonProperty("model_version")
        String modelVersion,

        @JsonProperty("model_result")
        JsonNode modelResult

) {
}