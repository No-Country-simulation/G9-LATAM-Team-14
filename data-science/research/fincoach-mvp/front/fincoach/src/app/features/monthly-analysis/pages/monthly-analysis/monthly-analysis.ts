import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import {
  DashboardApi,
  DashboardResponse,
  ExpenseCategorySummary,
  MonthlyAnalysisResponse,
  MonthlyTransaction,
} from '../../../../core/api/dashboard-api';
import { Footer } from '../../../../shared/layout/footer/footer';
import { Header } from '../../../../shared/layout/header/header';

interface ExpenseCard extends ExpenseCategorySummary {
  empty?: boolean;
}

@Component({
  selector: 'app-monthly-analysis',
  imports: [Footer, Header, RouterLink],
  templateUrl: './monthly-analysis.html',
})
export class MonthlyAnalysis {
  private readonly dashboardApi = inject(DashboardApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
  private readonly dateFormatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
  });
  private readonly monthFormatter = new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric',
  });

  readonly isLoading = signal(true);
  readonly isExporting = signal(false);
  readonly errorMessage = signal('');
  readonly exportError = signal('');
  readonly selectedMonth = signal('');
  readonly dashboard = signal<DashboardResponse | null>(null);
  readonly analysis = signal<MonthlyAnalysisResponse | null>(null);
  readonly expenseCards = computed<ExpenseCard[]>(() => {
    const categories = this.dashboard()?.expense_categories.slice(0, 4)
      ?? this.analysis()?.summary.top_expense_categories.slice(0, 4)
      ?? [];
    const cards: ExpenseCard[] = [...categories];

    while (cards.length < 4) {
      cards.push({
        category: 'Sin datos',
        amount: 0,
        percentage: 0,
        empty: true,
      });
    }

    return cards;
  });
  readonly pageNumbers = computed(() => {
    const totalPages = this.analysis()?.pagination.total_pages ?? 0;
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  });

  constructor() {
    const month = this.route.snapshot.queryParamMap.get('month');
    this.loadMonth(month || undefined);
  }

  loadMonth(month?: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      dashboard: this.dashboardApi.getDashboard(month),
      analysis: this.dashboardApi.getMonthlyAnalysis(month, 1),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ dashboard, analysis }) => {
          this.dashboard.set(dashboard);
          this.analysis.set(analysis);
          this.selectedMonth.set(analysis.month);
        },
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
  }

  changeMonth(event: Event): void {
    const month = (event.target as HTMLInputElement).value;
    if (!month || month === this.selectedMonth()) {
      return;
    }

    this.selectedMonth.set(month);
    this.loadMonth(month);
  }

  changePage(page: number): void {
    const pagination = this.analysis()?.pagination;
    if (
      this.isLoading()
      || !pagination
      || page < 1
      || page > pagination.total_pages
      || page === pagination.page
    ) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.dashboardApi
      .getMonthlyAnalysis(this.selectedMonth(), page)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (analysis) => this.analysis.set(analysis),
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
  }

  exportCsv(): void {
    const month = this.selectedMonth();
    if (!month || this.isExporting()) {
      return;
    }

    this.isExporting.set(true);
    this.exportError.set('');
    this.dashboardApi
      .exportMonthlyAnalysis(month)
      .pipe(finalize(() => this.isExporting.set(false)))
      .subscribe({
        next: (response) => {
          const file = response.body;
          if (!file) {
            this.exportError.set('El archivo CSV llegó vacío.');
            return;
          }

          const url = URL.createObjectURL(file);
          const link = this.document.createElement('a');
          link.href = url;
          link.download = this.exportFilename(
            response.headers.get('Content-Disposition'),
            month,
          );
          this.document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.router.navigate(['/login']);
            return;
          }

          this.exportError.set('No fue posible exportar los movimientos del mes.');
        },
      });
  }

  category(transaction: MonthlyTransaction): string {
    return transaction.categories[0]?.category ?? 'Sin categoría';
  }

  movementType(transaction: MonthlyTransaction): string {
    return transaction.direction === 'entrada' ? 'Ingreso' : 'Gasto';
  }

  formatAmount(transaction: MonthlyTransaction): string {
    const amount = this.currencyFormatter.format(transaction.amount);
    return transaction.direction === 'entrada' ? `+ ${amount}` : `− ${amount}`;
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    return this.dateFormatter.format(new Date(year, month - 1, day));
  }

  monthLabel(): string {
    const [year, month] = this.selectedMonth().split('-').map(Number);
    if (!year || !month) {
      return 'Mes actual';
    }

    const label = this.monthFormatter.format(new Date(year, month - 1, 1));
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  confidence(transaction: MonthlyTransaction): string {
    return transaction.confidence_percentage === null
      ? '—'
      : `${transaction.confidence_percentage.toFixed(2)}%`;
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.router.navigate(['/login']);
      return;
    }

    this.errorMessage.set('No fue posible consultar el análisis del mes.');
  }

  private exportFilename(disposition: string | null, month: string): string {
    const marker = 'filename=';
    const markerPosition = disposition?.indexOf(marker) ?? -1;
    if (disposition && markerPosition >= 0) {
      const value = disposition
        .slice(markerPosition + marker.length)
        .split(';')[0]
        .trim()
        .replaceAll('"', '');
      if (value) {
        return value;
      }
    }

    return `fincoach-transactions-${month}.csv`;
  }
}
