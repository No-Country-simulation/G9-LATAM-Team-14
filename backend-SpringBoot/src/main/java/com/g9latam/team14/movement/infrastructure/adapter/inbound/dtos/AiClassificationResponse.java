package com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos;
import java.util.List;
public record AiClassificationResponse(
        String category,
        Double categoryConfidencePercentage,
        List<AiAlternativeCategoryResponse> alternativeCategories,
        String purpose,
        String regularity,
        Boolean modelRequiresReview
) {
}
