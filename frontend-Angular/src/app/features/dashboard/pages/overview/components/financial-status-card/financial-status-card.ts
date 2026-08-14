import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';
import { DashboardSummaryService } from '@core/services/dashboard.service';

@Component({
  selector: 'app-financial-status-card',
  standalone: true,
  imports: [CommonModule, RouterLink, IconFinCoachComponent],
  templateUrl: './financial-status-card.html',
})
export class FinancialStatusCard implements OnInit {
  private dashboardService = inject(DashboardSummaryService);

  readonly circumference = 226.19;

  summary = this.dashboardService.summarySignal;

  confianzaNumber = computed(() => {
    return Math.round(this.summary()?.confianzaIaPct || 98);
  });

  confidence = computed(() => {
    return `${this.confianzaNumber()}%`;
  });

  strokeDashOffset = computed(() => {
    const pct = this.confianzaNumber() / 100;
    return this.circumference - (this.circumference * pct);
  });

  status = computed(() => {
    const balance = this.summary()?.balanceNeto || 0;
    if (balance > 0) return 'SALUDABLE';
    if (balance === 0) return 'EQUILIBRIO';
    return 'ALERTA / RIESGO';
  });

  title = computed(() => {
    const ocupacion = this.summary()?.ocupacionCuoc;
    if (ocupacion && ocupacion !== 'no_disponible') {
      return `Perfil: ${ocupacion}`;
    }
    return 'Tu perfil financiero este mes';
  });

  subtitle = computed(() => {
    const recs = this.summary()?.recomendaciones;
    if (recs && recs.length > 0) {
      return recs[0];
    }
    return 'El Modelo 1 de IA analizó tus ingresos, actividad y gastos declarados.';
  });

  ngOnInit(): void {
    if (!this.dashboardService.summarySignal()) {
      this.dashboardService.getSummary().subscribe({
        error: (err) => console.error('Error al cargar dashboard summary:', err)
      });
    }
  }
}
