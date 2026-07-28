package com.g9latam.team14.dashboard.infrastructure.adapter.inbound;

import com.g9latam.team14.auth.domain.ports.inbound.GetAuthenticatedUserUseCase;
import com.g9latam.team14.auth.domain.model.User;
import com.g9latam.team14.dashboard.domain.model.DashboardSummary;
import com.g9latam.team14.dashboard.domain.ports.inbound.GetDashboardSummaryUseCase;
import com.g9latam.team14.dashboard.infrastructure.adapter.inbound.dtos.DashboardSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardRestController {

    private final GetDashboardSummaryUseCase getDashboardSummaryUseCase;
    private final GetAuthenticatedUserUseCase getAuthenticatedUserUseCase;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = getAuthenticatedUserUseCase.getUserByEmail(email);
        DashboardSummary summary = getDashboardSummaryUseCase.getSummary(user.getId());

        return ResponseEntity.ok(toResponse(summary));
    }

    private DashboardSummaryResponse toResponse(DashboardSummary summary) {
        return new DashboardSummaryResponse(
                summary.getTotalIngresos(),
                summary.getTotalGastosFijos(),
                summary.getTotalGastosVariables(),
                summary.getBalanceNeto(),
                summary.getAlertas(),
                summary.getRecomendaciones()
        );
    }
}
