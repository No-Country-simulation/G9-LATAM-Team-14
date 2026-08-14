package com.g9latam.team14.evolucion.infrastructure.adapter.inbound;

import com.g9latam.team14.auth.domain.ports.inbound.GetAuthenticatedUserUseCase;
import com.g9latam.team14.evolucion.domain.model.EvolutionData;
import com.g9latam.team14.evolucion.domain.ports.inbound.GetEvolutionUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/evolucion")
@RequiredArgsConstructor
public class EvolutionRestController {
    private final GetEvolutionUseCase getEvolutionUseCase;
    private final GetAuthenticatedUserUseCase getAuthenticatedUserUseCase;

    @GetMapping
    public ResponseEntity<EvolutionData> getEvolution(
            @RequestParam(defaultValue = "6M") String rango
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = 1;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            var user = getAuthenticatedUserUseCase.getUserByEmail(auth.getName());
            if (user != null) {
                userId = user.getId();
            }
        }
        return ResponseEntity.ok(getEvolutionUseCase.getEvolution(userId, rango));
    }
}
