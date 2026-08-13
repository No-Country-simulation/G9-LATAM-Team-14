package com.g9latam.team14.transaction.infrastructure.adapter.outbound.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record DsTransactionClassificationResponse(

        @JsonProperty("category")
        String category,

        @JsonProperty("category_confidence_percentage")
        Double categoryConfidencePercentage,

        @JsonProperty("alternative_categories")
        List<DsTransactionAlternativeCategoryResponse> alternativeCategories,

        @JsonProperty("purpose")
        String purpose,

        @JsonProperty("regularity")
        String regularity,

        @JsonProperty("model_requires_review")
        Boolean modelRequiresReview

) {
}