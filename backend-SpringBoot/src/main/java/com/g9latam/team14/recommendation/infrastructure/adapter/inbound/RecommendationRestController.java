package com.g9latam.team14.recommendation.infrastructure.adapter.inbound;

import com.g9latam.team14.recommendation.domain.model.FinancialScore;
import com.g9latam.team14.recommendation.domain.ports.inbound.CompleteRecommendationUseCase;
import com.g9latam.team14.recommendation.domain.ports.inbound.GetRecommendationsUseCase;
import com.g9latam.team14.recommendation.infrastructure.adapter.inbound.dtos.RecommendationResponse;
import com.g9latam.team14.recommendation.infrastructure.adapter.inbound.dtos.ScoreResponse;
import com.g9latam.team14.recommendation.infrastructure.adapter.inbound.mapper.RecommendationDtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recomendaciones")
@RequiredArgsConstructor
public class RecommendationRestController {

    private final GetRecommendationsUseCase getRecommendationsUseCase;
    private final CompleteRecommendationUseCase completeRecommendationUseCase;
    private final RecommendationDtoMapper recommendationDtoMapper;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @GetMapping
    public ResponseEntity<List<RecommendationResponse>> getRecommendations() {
        Integer userId = authenticatedUserProvider.currentUserId();

        List<RecommendationResponse> response = getRecommendationsUseCase.getForCurrentMonth(userId)
                .stream()
                .map(recommendationDtoMapper::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/completar")
    public ResponseEntity<ScoreResponse> completeRecommendation(@PathVariable Integer id) {
        Integer userId = authenticatedUserProvider.currentUserId();

        FinancialScore score = completeRecommendationUseCase.complete(userId, id);

        return ResponseEntity.ok(recommendationDtoMapper.toResponse(score));
    }
}
