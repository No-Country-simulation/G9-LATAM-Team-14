import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { finalize, forkJoin } from 'rxjs';

import {
  DashboardApi,
  DashboardResponse,
} from '../../../../core/api/dashboard-api';
import {
  FinancialAnalysisApi,
  FinancialAnalysisResponse,
} from '../../../../core/api/financial-analysis-api';
import {
  FinancialProfile,
  ProfileApi,
} from '../../../../core/api/profile-api';
import {
  RecommendationApi,
  RecommendationResponse,
} from '../../../../core/api/recommendation-api';
import { Footer } from '../../../../shared/layout/footer/footer';
import { Header } from '../../../../shared/layout/header/header';

@Component({
  selector: 'app-overview',
  imports: [BaseChartDirective, Footer, Header, RouterLink],
  templateUrl: './overview.html',
})
export class Overview {
  private readonly profileApi = inject(ProfileApi);
  private readonly dashboardApi = inject(DashboardApi);
  private readonly financialAnalysisApi = inject(FinancialAnalysisApi);
  private readonly recommendationApi = inject(RecommendationApi);
  private readonly router = inject(Router);
  private readonly currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly profile = signal<FinancialProfile | null>(null);
  readonly dashboard = signal<DashboardResponse | null>(null);
  readonly currentAnalysis = signal<FinancialAnalysisResponse | null>(null);
  readonly previousAnalysis = signal<FinancialAnalysisResponse | null>(null);
  readonly isAnalysisLoading = signal(false);
  readonly analysisErrorMessage = signal('');
  readonly recommendationResult = signal<RecommendationResponse | null>(null);
  readonly isRecommendationLoading = signal(false);
  readonly recommendationErrorMessage = signal('');
  readonly confidencePercentage = computed(() => {
    const confidence = this.profile()?.classification.confidence_percentage ?? 0;
    return Math.min(100, Math.max(0, confidence));
  });
  readonly confidenceChartData = computed<ChartData<'doughnut'>>(() => {
    const confidence = this.confidencePercentage();

    return {
      labels: ['Confianza', 'Restante'],
      datasets: [
        {
          data: [confidence, 100 - confidence],
          backgroundColor: ['#315D36', '#C9D2B5'],
          borderColor: ['#315D36', '#C9D2B5'],
          borderWidth: 0,
          borderRadius: 12,
          hoverBackgroundColor: ['#315D36', '#C9D2B5'],
          hoverOffset: 0,
          spacing: 0,
        },
      ],
    };
  });
  readonly confidenceChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    rotation: -90,
    events: [],
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };
  readonly incomeDistributionData = computed<ChartData<'doughnut'>>(() => {
    const composition = this.dashboard()?.income_composition ?? [];
    const fixed = composition.find((item) => item.type === 'fixed')?.amount ?? 0;
    const variable =
      composition.find((item) => item.type === 'variable')?.amount ?? 0;

    return this.distributionData(fixed, variable);
  });
  readonly expenseDistributionData = computed<ChartData<'doughnut'>>(() => {
    const overview = this.dashboard()?.overview;

    return this.distributionData(
      overview?.fixed_expenses ?? 0,
      overview?.variable_expenses ?? 0,
    );
  });
  readonly incomeFixedPercentage = computed(() => {
    const composition = this.dashboard()?.income_composition ?? [];
    return composition.find((item) => item.type === 'fixed')?.percentage ?? 0;
  });
  readonly incomeVariablePercentage = computed(() => {
    const composition = this.dashboard()?.income_composition ?? [];
    return composition.find((item) => item.type === 'variable')?.percentage ?? 0;
  });
  readonly expenseFixedPercentage = computed(() => {
    const overview = this.dashboard()?.overview;
    return this.percentage(
      overview?.fixed_expenses ?? 0,
      (overview?.fixed_expenses ?? 0) + (overview?.variable_expenses ?? 0),
    );
  });
  readonly expenseVariablePercentage = computed(() => {
    const overview = this.dashboard()?.overview;
    const fixed = overview?.fixed_expenses ?? 0;
    const variable = overview?.variable_expenses ?? 0;

    return this.percentage(variable, fixed + variable);
  });
  readonly distributionChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    animation: {
      duration: 700,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
        onClick: () => undefined,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  constructor() {
    this.loadOverview();
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatMonth(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);
    const formatted = new Intl.DateTimeFormat('es-CO', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, monthNumber - 1, 1));

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  formatStatus(status: string): string {
    const formatted = status.replaceAll('_', ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`));
  }

  factorLabel(factor: string): string {
    const labels: Record<string, string> = {
      operating_balance: 'Balance operativo',
      essential_expense_coverage: 'Cobertura de gastos esenciales',
      income_variability: 'Comportamiento de ingresos',
      debt_balance: 'Saldo de las deudas',
    };
    return labels[factor] ?? this.formatStatus(factor);
  }

  assessmentLabel(assessment: string): string {
    const labels: Record<string, string> = {
      positive: 'Positivo',
      negative: 'Negativo',
      sufficient: 'Suficiente',
      limited: 'Limitada',
      variable: 'Variable',
      stable_or_unobserved: 'Estable o sin variación observada',
      increased: 'Aumentó',
      decreased: 'Disminuyó',
      unchanged: 'Sin cambios',
    };
    return labels[assessment] ?? this.formatStatus(assessment);
  }

  reasonLabel(reason: string): string {
    const labels: Record<string, string> = {
      no_confirmed_transactions: 'Aún no hay movimientos confirmados.',
      history_shorter_than_minimum_days: 'El historial todavía no cubre el periodo mínimo.',
      fewer_than_minimum_transactions: 'Todavía faltan movimientos confirmados.',
      income_context_outside_mvp: 'El contexto de ingresos está fuera del alcance del MVP.',
      financial_activity_not_calculable: 'La actividad financiera aún no se puede calcular.',
      state_confidence_below_threshold: 'La confianza del estado está por debajo del mínimo.',
      reserve_use_without_declared_goal: 'El uso de la reserva necesita una meta declarada.',
      financial_state_without_sufficient_evidence: 'El estado financiero no tiene evidencia suficiente.',
      financial_state_outside_catalog: 'El estado encontrado está fuera del catálogo del MVP.',
      financial_state_confidence_insufficient: 'La confianza del estado todavía es insuficiente.',
      financial_context_incomplete: 'Falta completar parte del contexto financiero.',
      state_probabilities_incomplete: 'Falta evidencia para comparar los posibles estados.',
      recommendation_confidence_insufficient: 'La recomendación no alcanzó la confianza mínima.',
      recommendation_outside_catalog: 'La recomendación está fuera del catálogo del MVP.',
    };
    return labels[reason] ?? this.formatStatus(reason);
  }

  safeguardLabel(safeguard: string): string {
    const labels: Record<string, string> = {
      protect_resources_without_income: 'Protección de recursos sin ingresos',
      critical_situation_requires_human_review: 'Revisión humana para una situación crítica',
      protect_essentials_and_debt: 'Protección de gastos esenciales y deuda',
      protect_essential_needs: 'Protección de necesidades esenciales',
      active_debt_considered: 'Deuda activa considerada',
      available_margin_considered: 'Margen disponible considerado',
      declared_goal_considered: 'Meta declarada considerada',
      goal_not_assumed: 'No se asumió una meta',
      income_variability_not_treated_as_risk: 'El ingreso variable no se trató automáticamente como riesgo',
      reserve_duration_considered: 'Duración de la reserva considerada',
      recent_change_requires_review: 'Cambio reciente sujeto a revisión',
      declared_hobbies_preserved: 'Hobbies declarados respetados',
    };
    return labels[safeguard] ?? this.formatStatus(safeguard);
  }

  comparisonWidth(value: number, otherValue: number): number {
    const maximum = Math.max(Math.abs(value), Math.abs(otherValue));
    return maximum > 0 ? Math.max(4, (Math.abs(value) / maximum) * 100) : 0;
  }

  changePercentage(currentValue: number, previousValue: number): number | null {
    const previous = this.previousAnalysis();
    const hasPreviousMovements = Boolean(
      previous &&
        (previous.summary.total_income > 0 ||
          previous.summary.total_expenses > 0),
    );

    if (!hasPreviousMovements || previousValue === 0) {
      return null;
    }

    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  }

  private distributionData(
    fixed: number,
    variable: number,
  ): ChartData<'doughnut'> {
    return {
      labels: ['Fijo', 'Variable'],
      datasets: [
        {
          data: [fixed, variable],
          backgroundColor: ['#315D36', '#E4A07D'],
          borderColor: '#F2F5D6',
          borderWidth: 4,
          hoverBackgroundColor: ['#274C2C', '#D98B67'],
          hoverOffset: 2,
        },
      ],
    };
  }

  private percentage(value: number, total: number): number {
    return total > 0 ? Number(((value / total) * 100).toFixed(2)) : 0;
  }

  private loadOverview(): void {
    forkJoin({
      profileResponse: this.profileApi.getMine(),
      dashboard: this.dashboardApi.getDashboard(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ profileResponse, dashboard }) => {
          this.profile.set(profileResponse.profile);
          this.dashboard.set(dashboard);
          this.loadFinancialComparison(dashboard.month);
          this.loadRecommendation();
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.router.navigate(['/profile']);
            return;
          }
          if (error.status === 401) {
            this.router.navigate(['/login']);
            return;
          }

          this.errorMessage.set(
            'No fue posible consultar tu resumen financiero.',
          );
        },
      });
  }

  private loadFinancialComparison(currentMonth: string): void {
    this.isAnalysisLoading.set(true);
    this.analysisErrorMessage.set('');

    forkJoin({
      current: this.financialAnalysisApi.analyze(currentMonth),
      previous: this.financialAnalysisApi.analyze(
        this.previousMonth(currentMonth),
      ),
    })
      .pipe(finalize(() => this.isAnalysisLoading.set(false)))
      .subscribe({
        next: ({ current, previous }) => {
          this.currentAnalysis.set(current);
          this.previousAnalysis.set(previous);
        },
        error: () => {
          this.analysisErrorMessage.set(
            'No fue posible comparar el comportamiento de los dos meses.',
          );
        },
      });
  }

  private previousMonth(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);
    const date = new Date(year, monthNumber - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private loadRecommendation(): void {
    this.isRecommendationLoading.set(true);
    this.recommendationErrorMessage.set('');

    this.recommendationApi
      .getCurrent()
      .pipe(finalize(() => this.isRecommendationLoading.set(false)))
      .subscribe({
        next: (result) => this.recommendationResult.set(result),
        error: () => {
          this.recommendationErrorMessage.set(
            'No fue posible consultar tu recomendación actual.',
          );
        },
      });
  }
}
