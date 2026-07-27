package com.g9latam.team14.dashboard.domain.ports.inbound;

import com.g9latam.team14.dashboard.domain.model.DashboardSummary;

public interface GetDashboardSummaryUseCase {
    DashboardSummary getSummary(Integer userId);
}
