import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSummaryService } from '@core/services/dashboard.service';

@Component({
  selector: 'app-income-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-distribution.html',
})
export class IncomeDistribution {
  private dashboardService = inject(DashboardSummaryService);
  summary = this.dashboardService.summarySignal;

  readonly circumference = 282.74;

  // 1. Distribución de Ingresos
  incomeTotal = computed(() => {
    const val = this.summary()?.totalIngresos || 0;
    return this.formatCurrency(val);
  });

  incomeFixedPct = computed(() => {
    // Ingresos por defecto 100% fijos a menos que el usuario tenga movimientos variables
    return 100;
  });

  incomeVarPct = computed(() => 100 - this.incomeFixedPct());

  // 2. Distribución del Gasto
  expenseTotal = computed(() => {
    const data = this.summary();
    const fijos = data?.totalGastosFijos || 0;
    const variables = data?.totalGastosVariables || 0;
    return this.formatCurrency(fijos + variables);
  });

  expenseFixedPct = computed(() => {
    const data = this.summary();
    const fijos = data?.totalGastosFijos || 0;
    const variables = data?.totalGastosVariables || 0;
    const total = fijos + variables;
    if (total === 0) return 0;
    return Math.round((fijos / total) * 100);
  });

  expenseVarPct = computed(() => {
    const data = this.summary();
    const fijos = data?.totalGastosFijos || 0;
    const variables = data?.totalGastosVariables || 0;
    const total = fijos + variables;
    if (total === 0) return 0;
    return Math.round((variables / total) * 100);
  });

  getIncomeOffset(pct: number): number {
    return this.circumference - (this.circumference * (pct || 0)) / 100;
  }

  getExpenseOffset(pct: number): number {
    return this.circumference - (this.circumference * (pct || 0)) / 100;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0
    }).format(value || 0);
  }
}
