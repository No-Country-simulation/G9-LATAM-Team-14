package com.g9latam.team14.movement.infrastructure.adapter.outbound.ai;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
public record DsClassificationResponse(
        @JsonProperty("category")
        String category,

        @JsonProperty("category_confidence_percentage")
        Double categoryConfidencePercentage,

        @JsonProperty("alternative_categories")
        List<DsAlternativeCategoryResponse> alternativeCategories,

        @JsonProperty("purpose")
        String purpose,

        @JsonProperty("regularity")
        String regularity,

        @JsonProperty("model_requires_review")
        Boolean modelRequiresReview
) {}
