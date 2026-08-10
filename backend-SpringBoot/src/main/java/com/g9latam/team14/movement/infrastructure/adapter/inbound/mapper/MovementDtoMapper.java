package com.g9latam.team14.movement.infrastructure.adapter.inbound.mapper;
import com.g9latam.team14.movement.domain.model.AiAlternativeCategory;
import com.g9latam.team14.movement.domain.model.AiClassification;
import com.g9latam.team14.movement.domain.model.Movement;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.AiAlternativeCategoryResponse;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.AiClassificationResponse;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.CreateMovementRequest;
import com.g9latam.team14.movement.infrastructure.adapter.inbound.dtos.MovementResponse;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class MovementDtoMapper {
    public Movement toDomain(CreateMovementRequest request) {
        return Movement.builder()
                .id(null)
                .description(request.description())
                .amount(request.amount())
                .type(request.type())
                .category(request.category())
                .date(request.date())
                .userId(request.userId())
                .aiClassification(null)
                .build();
    }

    public MovementResponse toResponse(Movement movement) {
        AiClassification ai = movement.getAiClassification();
        AiClassificationResponse suggestion = null;
        if (ai != null) {
            List<AiAlternativeCategoryResponse> alternatives = ai.getAlternativeCategories() != null
                    ? ai.getAlternativeCategories().stream()
                          .map(a -> new AiAlternativeCategoryResponse(a.getCategory(), a.getPercentage()))
                          .toList()
                    : List.of();

            suggestion = new AiClassificationResponse(
                    ai.getCategory(),
                    ai.getCategoryConfidencePercentage(),
                    alternatives,
                    ai.getPurpose(),
                    ai.getRegularity(),
                    ai.getModelRequiresReview()
            );
        }

        return new MovementResponse(
                movement.getId(),
                movement.getDescription(),
                movement.getAmount(),
                movement.getType(),
                movement.getCategory(),
                movement.getDate(),
                movement.getUserId(),
                ai != null && Boolean.TRUE.equals(ai.getModelRequiresReview())
                        ? "PENDING_CONFIRMATION"
                        : "CONFIRMED",
                suggestion
        );
    }

    public AiClassificationResponse aiToResponse(com.g9latam.team14.movement.domain.model.AiClassification ai) {
        if (ai == null) return null;

        List<AiAlternativeCategoryResponse> alternatives = ai.getAlternativeCategories() != null
                ? ai.getAlternativeCategories().stream()
                      .map(a -> new AiAlternativeCategoryResponse(a.getCategory(), a.getPercentage()))
                      .toList()
                : List.of();

        return new AiClassificationResponse(
                ai.getCategory(),
                ai.getCategoryConfidencePercentage(),
                alternatives,
                ai.getPurpose(),
                ai.getRegularity(),
                ai.getModelRequiresReview()
        );
    }
}
