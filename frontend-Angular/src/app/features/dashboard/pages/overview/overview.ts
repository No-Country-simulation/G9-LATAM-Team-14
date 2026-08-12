import { Component } from '@angular/core';
import { FinancialStatusCard } from './components/financial-status-card/financial-status-card';
import { MetricsCards } from './components/metrics-cards/metrics-cards';
import { IncomeDistribution } from './components/income-distribution/income-distribution';

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
export class Overview {}
