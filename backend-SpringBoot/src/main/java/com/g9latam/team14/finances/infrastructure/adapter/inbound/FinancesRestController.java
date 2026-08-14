package com.g9latam.team14.finances.infrastructure.adapter.inbound;
import com.g9latam.team14.auth.domain.ports.inbound.GetAuthenticatedUserUseCase;
import com.g9latam.team14.finances.domain.model.FinancesData;
import com.g9latam.team14.finances.domain.ports.inbound.GetFinancesUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/finances")
@RequiredArgsConstructor
public class FinancesRestController {

    private final GetFinancesUseCase getFinancesUseCase;
    private final GetAuthenticatedUserUseCase getAuthenticatedUserUseCase;

    @GetMapping
    public ResponseEntity<FinancesData> getFinances(
            @RequestParam(defaultValue = "60") Integer periodDays
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer userId = 1;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            var user = getAuthenticatedUserUseCase.getUserByEmail(auth.getName());
            if (user != null) {
                userId = user.getId();
            }
        }

        return ResponseEntity.ok(getFinancesUseCase.getFinances(userId, periodDays));
    }
}
