import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';
import { DashboardSummaryService } from '@core/services/dashboard.service';
import { ProfileService, UserProfileResponse } from '@core/profile/services/profile.service';

@Component({
  selector: 'app-financial-status-card',
  standalone: true,
  imports: [CommonModule, RouterLink, IconFinCoachComponent],
  templateUrl: './financial-status-card.html',
})
export class FinancialStatusCard implements OnInit {
  private dashboardService = inject(DashboardSummaryService);
  private profileService = inject(ProfileService);

  readonly circumference = 226.19;

  summary = this.dashboardService.summarySignal;
  profileData = signal<UserProfileResponse | null>(null);

  confianzaNumber = computed(() => {
    const fromProfile = this.profileData()?.confianzaIaPct;
    if (fromProfile !== undefined && fromProfile !== null) {
      return Math.round(fromProfile);
    }
    const fromSummary = this.summary()?.confianzaIaPct;
    if (fromSummary !== undefined && fromSummary !== null) {
      return Math.round(fromSummary);
    }
    return 0;
  });

  confidence = computed(() => {
    const val = this.confianzaNumber();
    return val > 0 ? `${val}%` : '0%';
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
    const prof = this.profileData();
    const declared = prof?.actividadPrincipal;
    if (declared && declared !== 'no_disponible') {
      return `Perfil: ${declared}`;
    }
    const ocupacion = prof?.ocupacionCuoc || this.summary()?.ocupacionCuoc;
    if (ocupacion && ocupacion !== 'no_disponible') {
      return `Perfil: ${ocupacion}`;
    }
    return 'Tu perfil financiero este mes';
  });

  subtitle = computed(() => {
    const prof = this.profileData();
    if (prof?.ocupacionCuoc && prof.ocupacionCuoc !== 'no_disponible') {
      return `Clasificación IA (CUOC): ${prof.ocupacionCuoc}`;
    }
    const recs = this.summary()?.recomendaciones;
    if (recs && recs.length > 0) {
      return recs[0];
    }
    return 'El Modelo 1 de IA analizó tus ingresos, actividad y gastos declarados.';
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.profileService.getProfile().subscribe({
      next: (prof) => {
        if (prof) {
          this.profileData.set(prof);
        }
      },
      error: (err) => console.error('Error al cargar perfil en tarjeta overview:', err)
    });

    if (!this.dashboardService.summarySignal()) {
      this.dashboardService.getSummary().subscribe({
        error: (err) => console.error('Error al cargar dashboard summary:', err)
      });
    }
  }
}
