import { Component, inject, OnInit } from '@angular/core';
import { FinancialStatusCard } from './components/financial-status-card/financial-status-card';
import { MetricsCards } from './components/metrics-cards/metrics-cards';
import { IncomeDistribution } from './components/income-distribution/income-distribution';
import { DashboardSummaryService } from '@core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    FinancialStatusCard,
    MetricsCards,
    IncomeDistribution
  ],
  templateUrl: './overview.html',
})
export class Overview implements OnInit {
  private dashboardService = inject(DashboardSummaryService);

  ngOnInit(): void {
    this.dashboardService.getSummary(true).subscribe({
      error: (err) => console.error('Error al cargar summary en overview:', err)
    });
  }
}
