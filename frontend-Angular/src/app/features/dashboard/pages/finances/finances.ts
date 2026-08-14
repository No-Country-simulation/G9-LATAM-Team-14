import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, UserProfileResponse } from '@core/profile/services/profile.service';
import { FinancesService, FinancesDataResponse, FactorObserved } from '@core/finances/services/finances.service';
import {
  FinancesHeader,
  FinancialStatusCard,
  FinancialRecommendationCard
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
  private financesService = inject(FinancesService);

  profileData = signal<UserProfileResponse | null>(null);
  financesData = signal<FinancesDataResponse | null>(null);
  selectedPeriod = signal<30 | 60 | 90>(60);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadProfile();
    this.loadFinances(60);
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => this.profileData.set(data),
      error: (err) => console.error('Error al cargar perfil:', err)
    });
  }

  loadFinances(periodDays: 30 | 60 | 90): void {
    this.isLoading.set(true);
    this.financesService.getFinances(periodDays).subscribe({
      next: (data) => {
        this.financesData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener finanzas de backend:', err);
        this.isLoading.set(false);
      }
    });
  }

  setPeriod(period: 30 | 60 | 90): void {
    this.selectedPeriod.set(period);
    this.loadFinances(period);
  }

  confidencePct = computed(() => {
    return this.financesData()?.financialStatus?.confidencePercentage ?? 0;
  });

  daysWithHistory = computed(() => {
    return this.financesData()?.financialStatus?.daysWithHistory ?? 0;
  });

  confirmedMovements = computed(() => {
    return this.financesData()?.financialStatus?.confirmedMovements ?? 0;
  });

  dateRangeText = computed(() => {
    return this.financesData()?.financialStatus?.dateRangeText || '';
  });

  observedFactors = computed<FactorObserved[]>(() => {
    return this.financesData()?.financialStatus?.mainFactors || [];
  });

  appliedSafeguards = computed<string[]>(() => {
    return this.financesData()?.financialRecommendation?.appliedSafeguards || [];
  });
}
