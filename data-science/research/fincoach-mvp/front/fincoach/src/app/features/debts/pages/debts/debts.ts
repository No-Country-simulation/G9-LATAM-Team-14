import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartData,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { finalize, forkJoin } from 'rxjs';

import {
  DebtApi,
  DebtListItem,
  DebtListResponse,
  DebtType,
} from '../../../../core/api/debt-api';
import {
  FinancialTransaction,
  TransactionApi,
} from '../../../../core/api/transaction-api';
import { Footer } from '../../../../shared/layout/footer/footer';
import { Header } from '../../../../shared/layout/header/header';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
);

interface MonthlyDebtPayment {
  debt: DebtListItem;
  paidAmount: number;
  percentage: number;
  status: 'paid' | 'partial' | 'pending';
}

@Component({
  selector: 'app-debts',
  imports: [BaseChartDirective, Footer, Header, RouterLink],
  templateUrl: './debts.html',
})
export class Debts {
  private readonly debtApi = inject(DebtApi);
  private readonly transactionApi = inject(TransactionApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
  private readonly monthFormatter = new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    year: 'numeric',
  });
  private readonly dateFormatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  readonly selectedMonth = signal(
    this.route.snapshot.queryParamMap.get('month') || this.currentMonth(),
  );
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly debtData = signal<DebtListResponse | null>(null);
  readonly monthTransactions = signal<FinancialTransaction[]>([]);
  readonly activeDebts = computed(() =>
    this.debtData()?.debts.filter((debt) => debt.status === 'active') ?? [],
  );
  readonly monthlyPayments = computed<MonthlyDebtPayment[]>(() => {
    const paidByDebt = new Map<number, number>();
    for (const transaction of this.monthTransactions()) {
      const debtId = transaction.final_classification?.debt_id;
      if (
        transaction.status === 'confirmed'
        && transaction.direction === 'salida'
        && debtId
      ) {
        paidByDebt.set(
          debtId,
          (paidByDebt.get(debtId) ?? 0) + transaction.amount,
        );
      }
    }

    return this.activeDebts().map((debt) => {
      const paidAmount = paidByDebt.get(debt.id) ?? 0;
      const percentage = debt.monthly_payment
        ? Math.min(100, paidAmount / debt.monthly_payment * 100)
        : 0;
      return {
        debt,
        paidAmount,
        percentage,
        status: paidAmount >= debt.monthly_payment
          ? 'paid'
          : paidAmount > 0
            ? 'partial'
            : 'pending',
      };
    });
  });
  readonly evolutionChartData = computed<ChartData<'line'>>(() => {
    const evolution = this.debtData()?.evolution ?? [];
    return {
      labels: evolution.map((item) => this.shortMonth(item.month)),
      datasets: [
        {
          label: 'Saldo pendiente',
          data: evolution.map((item) => item.outstanding_balance),
          borderColor: '#315D36',
          backgroundColor: 'rgba(109, 140, 75, 0.18)',
          pointBackgroundColor: '#315D36',
          pointBorderColor: '#F5F8DE',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          tension: 0.32,
          fill: true,
        },
      ],
    };
  });
  readonly evolutionChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: (context) => this.formatCurrency(Number(context.raw)),
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#68775F',
          font: { size: 10, weight: 600 },
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(104, 119, 95, 0.13)',
        },
        ticks: {
          color: '#68775F',
          font: { size: 10, weight: 600 },
          callback: (value) => this.compactCurrency(Number(value)),
        },
      },
    },
  };

  constructor() {
    this.loadDebts();
  }

  loadDebts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      debts: this.debtApi.getAll(),
      transactions: this.transactionApi.getConfirmedByMonth(
        this.selectedMonth(),
      ),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ debts, transactions }) => {
          this.debtData.set(debts);
          this.monthTransactions.set(transactions.transactions);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.router.navigate(['/login']);
            return;
          }

          this.errorMessage.set('No fue posible consultar tus deudas.');
        },
      });
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  compactCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)} M`;
    }
    if (value >= 1000) {
      return `$${Math.round(value / 1000)} mil`;
    }
    return `$${value}`;
  }

  formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    return this.dateFormatter.format(new Date(year, month - 1, day));
  }

  monthLabel(): string {
    return this.fullMonth(this.selectedMonth());
  }

  debtTypeLabel(type: DebtType): string {
    const labels: Record<DebtType, string> = {
      housing: 'Crédito de vivienda',
      educational: 'Crédito educativo',
      credit_card: 'Tarjeta de crédito',
      vehicle: 'Crédito de vehículo',
      personal: 'Crédito personal',
    };
    return labels[type];
  }

  paymentStatusLabel(status: MonthlyDebtPayment['status']): string {
    const labels = {
      paid: 'Cuota cubierta',
      partial: 'Pago parcial',
      pending: 'Cuota pendiente',
    };
    return labels[status];
  }

  monthsUntilDebtFree(): string {
    const endDate = this.debtData()?.summary.projected_end_date;
    if (!endDate) {
      return 'Sin deudas activas';
    }

    const [year, month] = endDate.split('-').map(Number);
    const today = new Date();
    const months = Math.max(
      0,
      (year - today.getFullYear()) * 12 + month - (today.getMonth() + 1),
    );
    return months === 1 ? 'Falta 1 mes' : `Faltan ${months} meses`;
  }

  private currentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private shortMonth(value: string): string {
    const [year, month] = value.split('-').map(Number);
    return this.monthFormatter.format(new Date(year, month - 1, 1));
  }

  private fullMonth(value: string): string {
    const label = this.shortMonth(value);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
