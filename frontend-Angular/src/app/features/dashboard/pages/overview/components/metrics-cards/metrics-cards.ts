import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent, IconName } from '@app/shared/icons/iconsFinCoach';
import { DashboardSummaryService } from '@core/services/dashboard.service';

export interface OverviewMetric {
  title: string;
  amount: string;
  detail: string;
  icon: IconName;
  badgeBg: string;
  badgeColor: string;
}

@Component({
  selector: 'app-metrics-cards',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './metrics-cards.html',
})
export class MetricsCards {
  private dashboardService = inject(DashboardSummaryService);
  summary = this.dashboardService.summarySignal;

  metrics = computed<OverviewMetric[]>(() => {
    const data = this.summary();
    const ingresos = data?.totalIngresos || 0;
    const gastosFijos = data?.totalGastosFijos || 0;
    const gastosVariables = data?.totalGastosVariables || 0;
    const disponible = data?.balanceNeto || (ingresos - gastosFijos - gastosVariables);

    return [
      {
        title: 'Ingreso total',
        amount: this.formatCurrency(ingresos),
        detail: 'Entradas confirmadas del mes',
        icon: 'arrow-up',
        badgeBg: 'bg-[#D7E3A9]',
        badgeColor: 'text-[#214523]'
      },
      {
        title: 'Gastos fijos',
        amount: this.formatCurrency(gastosFijos),
        detail: 'Egresos clasificados como fijos',
        icon: 'home',
        badgeBg: 'bg-[#FCE6D4]',
        badgeColor: 'text-[#D96B27]'
      },
      {
        title: 'Gastos variables',
        amount: this.formatCurrency(gastosVariables),
        detail: 'Egresos variables del mes',
        icon: 'arrow-down',
        badgeBg: 'bg-[#FADCD9]',
        badgeColor: 'text-[#D9534F]'
      },
      {
        title: 'Disponible',
        amount: this.formatCurrency(disponible),
        detail: 'Ingresos menos gastos del mes',
        icon: 'check-circle',
        badgeBg: disponible >= 0 ? 'bg-[#D7E3A9]' : 'bg-[#FADCD9]',
        badgeColor: disponible >= 0 ? 'text-[#214523]' : 'text-[#D9534F]'
      }
    ];
  });

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0
    }).format(value || 0);
  }
}
