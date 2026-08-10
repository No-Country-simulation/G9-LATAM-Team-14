package com.g9latam.team14.movement.domain.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class AiClassification {
    private final String category;
    private final Double categoryConfidencePercentage;
    private final List<AiAlternativeCategory> alternativeCategories;
    private final String purpose;
    private final String regularity;
    private final Boolean modelRequiresReview;
}
