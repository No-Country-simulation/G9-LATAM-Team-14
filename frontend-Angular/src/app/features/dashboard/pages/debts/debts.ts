import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebtsHeaderComponent } from './components/debts-header/debts-header';
import { DebtsSummaryCardsComponent } from './components/debts-summary-cards/debts-summary-cards';
import { ActiveDebtsListComponent, ActiveDebt } from './components/active-debts-list/active-debts-list';
import { DebtProjectionChartComponent } from './components/debt-projection-chart/debt-projection-chart';
import { MonthlyDebtStatusListComponent, MonthlyDebtPayment } from './components/paid-debts-list/paid-debts-list';
import { AddDebtModalComponent, NewDebtPayload } from './components/add-debt-modal/add-debt-modal';
import { RegisteredDebtModalComponent } from './components/registered-debt-modal/registered-debt-modal';
import { DebtService } from '@app/core/debts/services/debt.service';
import { AuthService } from '@app/core/auth/services/auth.service';
import { Debt, DebtSummary, DebtProjectionPoint } from '@app/core/debts/models/debt.model';

@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [
    CommonModule,
    DebtsHeaderComponent,
    DebtsSummaryCardsComponent,
    ActiveDebtsListComponent,
    DebtProjectionChartComponent,
    MonthlyDebtStatusListComponent,
    AddDebtModalComponent,
    RegisteredDebtModalComponent
  ],
  templateUrl: './debts.html',
})
export class Debts implements OnInit {
  private debtService = inject(DebtService);
  private authService = inject(AuthService);
  isModalOpen = signal<boolean>(false);
  editingDebt = signal<Debt | null>(null);
  mobileViewMode = signal<'debts' | 'summary'>('debts');

  isSuccessModalOpen = signal<boolean>(false);
  lastRegisteredDebt = signal<NewDebtPayload | null>(null);

  summaryData = signal<DebtSummary>({
    totalPendingAmount: 0,
    totalMonthlyPayment: 0,
    incomePercentage: 0,
    estimatedFreeDate: '-',
    monthsRemaining: 0
  });
  activeDebts = signal<ActiveDebt[]>([]);
  monthlyDebtPayments = signal<MonthlyDebtPayment[]>([]);
  projectionPoints = signal<DebtProjectionPoint[]>([]);
  readonly currentMonthLabel = new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const userId = this.authService.currentUser()?.id || 1;
    this.debtService.getDebts('ACTIVE', userId).subscribe({
      next: (debts) => {
        const activeDebts = debts || [];
        this.activeDebts.set(activeDebts.map(d => this.mapToActiveDebt(d)));
        this.monthlyDebtPayments.set(activeDebts.map(d => this.mapToMonthlyPayment(d)));
      },
      error: (err) => {
        console.error('Error al cargar deudas activas desde la BD:', err);
        this.activeDebts.set([]);
        this.monthlyDebtPayments.set([]);
      }
    });

    this.debtService.getSummary(userId).subscribe({
      next: (summary) => {
        if (summary) {
          this.summaryData.set(summary);
        }
      },
      error: (err) => {
        console.error('Error al cargar resumen de deudas desde la BD:', err);
      }
    });

    this.debtService.getProjection(userId).subscribe({
      next: (points) => {
        this.projectionPoints.set(points || []);
      },
      error: (err) => {
        console.error('Error al cargar proyección desde la BD:', err);
        this.projectionPoints.set([]);
      }
    });
  }

  toggleMobileView(): void {
    this.mobileViewMode.update(mode => mode === 'debts' ? 'summary' : 'debts');
  }

  onAddDebt(): void {
    this.editingDebt.set(null);
    this.isModalOpen.set(true);
  }

  onEditDebt(activeDebt: ActiveDebt): void {
    if (activeDebt.raw) {
      this.editingDebt.set(activeDebt.raw);
      this.isModalOpen.set(true);
    }
  }

  onDeleteDebt(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta deuda?')) {
      this.debtService.deleteDebt(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Error al eliminar la deuda:', err);
        }
      });
    }
  }

  onCloseModal(): void {
    this.isModalOpen.set(false);
    this.editingDebt.set(null);
  }

  onCloseSuccessModal(): void {
    this.isSuccessModalOpen.set(false);
    this.lastRegisteredDebt.set(null);
  }

  onSaveDebt(payload: NewDebtPayload): void {
    this.lastRegisteredDebt.set(payload);
    this.onCloseModal();
    this.isSuccessModalOpen.set(true);
  }

  onConfirmSaveDebt(): void {
    const payload = this.lastRegisteredDebt();
    if (!payload) {
      this.onCloseSuccessModal();
      return;
    }

    const userId = this.authService.currentUser()?.id || 1;
    const request: any = {
      type: payload.type === 'installment' ? 'INSTALLMENT' : 'FIXED',
      category: payload.category,
      totalAmount: payload.totalAmount,
      monthlyAmount: payload.monthlyAmount,
      monthsTerm: payload.monthsTerm,
      paymentMode: payload.paymentMode === 'fixed_term' ? 'FIXED_TERM' : 'FREE_PAYMENT',
      startDate: payload.startDate,
      endDate: payload.endDate,
      isIndefinite: payload.isIndefinite,
      status: this.editingDebt()?.status || 'ACTIVE',
      paidInstallments: this.editingDebt()?.paidInstallments || 0,
      userId
    };

    if (payload.id) {
      this.debtService.updateDebt(payload.id, request).subscribe({
        next: () => {
          this.loadData();
          this.onCloseSuccessModal();
        },
        error: (err) => {
          console.error('Error al actualizar la deuda:', err);
          this.onCloseSuccessModal();
        }
      });
    } else {
      this.debtService.createDebt(request).subscribe({
        next: () => {
          this.loadData();
          this.onCloseSuccessModal();
        },
        error: (err) => {
          console.error('Error al guardar la deuda en la BD:', err);
          this.onCloseSuccessModal();
        }
      });
    }
  }

  private mapToActiveDebt(d: Debt): ActiveDebt {
    const isInstallment = d.type === 'INSTALLMENT';
    const total = d.totalAmount || (d.monthlyAmount * (d.monthsTerm || 12));
    const outstanding = d.outstandingBalance ?? total;
    const paidAmount = Math.max(0, total - outstanding);
    const term = d.monthsTerm || 12;
    const paid = d.paidInstallments || 0;
    const progressPct = total > 0 ? Math.min(100, Math.round((paidAmount / total) * 100)) : 0;
    const rate = d.annualEffectiveRate ?? 0;

    return {
      id: d.id || Date.now(),
      title: d.category,
      subtitle: `Saldo $ ${outstanding.toLocaleString()} · ${rate}% EA`,
      monthlyPayment: `$ ${d.monthlyAmount}/mes`,
      remainingAmount: `Quedan $ ${outstanding.toLocaleString()}`,
      progressText: isInstallment ? `Progreso ${paid}/${term}` : `${paid}/${term} cuotas`,
      percentage: progressPct,
      iconName: d.category.toLowerCase().includes('vehicular') || d.category.toLowerCase().includes('auto') ? 'car' : 'debts',
      raw: d
    };
  }

  private mapToMonthlyPayment(d: Debt): MonthlyDebtPayment {
    const monthlyAmount = Number(d.monthlyAmount || 0);
    const paidAmount = Number(d.paidAmountThisMonth || 0);
    const percentage = monthlyAmount > 0
      ? Math.min(100, Math.round((paidAmount / monthlyAmount) * 100))
      : 0;

    return {
      id: d.id || Date.now(),
      title: d.category,
      paidAmount,
      monthlyAmount,
      percentage,
      status: d.monthlyPaymentStatus || 'PENDING'
    };
  }
}
