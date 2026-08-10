package com.g9latam.team14.evolucion.infrastructure.adapter.inbound;

import com.g9latam.team14.evolucion.domain.model.EvolutionData;
import com.g9latam.team14.evolucion.domain.ports.inbound.GetEvolutionUseCase;
import com.g9latam.team14.recommendation.infrastructure.adapter.inbound.AuthenticatedUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/evolucion")
@RequiredArgsConstructor
public class EvolutionRestController {

    private final GetEvolutionUseCase getEvolutionUseCase;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @GetMapping
    public ResponseEntity<EvolutionData> getEvolution(
            @RequestParam(defaultValue = "6M") String rango
    ) {
        Integer userId = authenticatedUserProvider.currentUserId();
        return ResponseEntity.ok(getEvolutionUseCase.getEvolution(userId, rango));
    }
}
