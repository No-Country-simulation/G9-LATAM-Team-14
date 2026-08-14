import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, UserProfileResponse } from '@core/profile/services/profile.service';
import {
  FinancesHeader,
  FinancialStatusCard,
  FinancialRecommendationCard,
  FactorObserved
} from './components';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [
    CommonModule,
    FinancesHeader,
    FinancialStatusCard,
    FinancialRecommendationCard
  ],
  templateUrl: './finances.html'
})
export class Finances implements OnInit {
  private profileService = inject(ProfileService);

  profileData = signal<UserProfileResponse | null>(null);
  selectedPeriod = signal<30 | 60 | 90>(60);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profileData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar perfil en Finanzas:', err);
        this.isLoading.set(false);
      }
    });
  }

  setPeriod(period: 30 | 60 | 90): void {
    this.selectedPeriod.set(period);
  }

  confidencePct = computed(() => {
    const base = this.profileData()?.confianzaIaPct || 85;
    const period = this.selectedPeriod();
    if (period === 30) return Math.min(base, 80);
    if (period === 90) return Math.min(base + 5, 98);
    return base;
  });

  daysWithHistory = computed(() => this.selectedPeriod());

  confirmedMovements = computed(() => {
    const p = this.selectedPeriod();
    if (p === 30) return 24;
    if (p === 60) return 48;
    return 72;
  });

  dateRangeText = computed(() => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - this.selectedPeriod());
    const opt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${past.toLocaleDateString('es-PE', opt)} — ${now.toLocaleDateString('es-PE', opt)}`;
  });

  observedFactors = computed<FactorObserved[]>(() => [
    { name: 'Flujo Neto (Ingresos vs Gastos)', assessment: 'Superávit Positivo (+28%)' },
    { name: 'Capacidad de Pago', assessment: 'Saludable y Sostenible' },
    { name: 'Frecuencia de Ahorro', assessment: this.profileData()?.frecuenciaAhorro || 'Constante' },
    { name: 'Nivel de Endeudamiento', assessment: 'Bajo / Controlado (<20%)' }
  ]);

  appliedSafeguards = signal<string[]>([
    'Capacidad de Pago Verificada',
    'Estabilidad de Ingresos',
    'Protección de Liquidez Mínima',
    'Evaluación Ética de Riesgo'
  ]);
}
