package com.g9latam.team14.recommendation.infrastructure.adapter.inbound;

import com.g9latam.team14.recommendation.domain.model.FinancialScore;
import com.g9latam.team14.recommendation.domain.ports.inbound.GetScoreUseCase;
import com.g9latam.team14.recommendation.infrastructure.adapter.inbound.dtos.ScoreResponse;
import com.g9latam.team14.recommendation.infrastructure.adapter.inbound.mapper.RecommendationDtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuario")
@RequiredArgsConstructor
public class ScoreRestController {

    private final GetScoreUseCase getScoreUseCase;
    private final RecommendationDtoMapper recommendationDtoMapper;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @GetMapping("/score")
    public ResponseEntity<ScoreResponse> getScore() {
        Integer userId = authenticatedUserProvider.currentUserId();

        FinancialScore score = getScoreUseCase.getScore(userId);

        return ResponseEntity.ok(recommendationDtoMapper.toResponse(score));
    }
}
