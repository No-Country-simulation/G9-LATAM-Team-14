import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebtsHeaderComponent } from './components/debts-header/debts-header';
import { DebtsSummaryCardsComponent } from './components/debts-summary-cards/debts-summary-cards';
import { ActiveDebtsListComponent, ActiveDebt } from './components/active-debts-list/active-debts-list';
import { DebtProjectionChartComponent } from './components/debt-projection-chart/debt-projection-chart';
import { PaidDebtsListComponent, PaidDebt } from './components/paid-debts-list/paid-debts-list';
import { AddDebtModalComponent, NewDebtPayload } from './components/add-debt-modal/add-debt-modal';
import { DebtService } from '@app/core/debts/services/debt.service';
import { AuthService } from '@app/core/auth/services/auth.service';
import { Debt, CreateDebtRequest, DebtSummary } from '@app/core/debts/models/debt.model';

@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [
    CommonModule,
    DebtsHeaderComponent,
    DebtsSummaryCardsComponent,
    ActiveDebtsListComponent,
    DebtProjectionChartComponent,
    PaidDebtsListComponent,
    AddDebtModalComponent
  ],
  templateUrl: './debts.html',
})
export class Debts implements OnInit {
  private debtService = inject(DebtService);
  private authService = inject(AuthService);
  isModalOpen = signal<boolean>(false);
  summaryData = signal<DebtSummary>({
    totalPendingAmount: 0,
    totalMonthlyPayment: 0,
    incomePercentage: 0,
    estimatedFreeDate: '-',
    monthsRemaining: 0
  });
  activeDebts = signal<ActiveDebt[]>([]);
  paidDebts = signal<PaidDebt[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const userId = this.authService.currentUser()?.id || 1;
    this.debtService.getDebts('ACTIVE', userId).subscribe({
      next: (debts) => {
        this.activeDebts.set((debts || []).map(d => this.mapToActiveDebt(d)));
      },
      error: (err) => {
        console.error('Error al cargar deudas activas desde la BD:', err);
        this.activeDebts.set([]);
      }
    });

    this.debtService.getDebts('PAID', userId).subscribe({
      next: (debts) => {
        this.paidDebts.set((debts || []).map(d => ({
          id: d.id || Date.now(),
          title: d.category,
          date: d.endDate || 'Pagada'
        })));
      },
      error: (err) => {
        console.error('Error al cargar deudas pagadas desde la BD:', err);
        this.paidDebts.set([]);
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
  }

  onAddDebt(): void {
    this.isModalOpen.set(true);
  }

  onCloseModal(): void {
    this.isModalOpen.set(false);
  }

  onSaveDebt(payload: NewDebtPayload): void {
    const userId = this.authService.currentUser()?.id || 1;
    const request: CreateDebtRequest = {
      type: payload.type === 'installment' ? 'INSTALLMENT' : 'FIXED',
      category: payload.category,
      totalAmount: payload.totalAmount,
      monthlyAmount: payload.monthlyAmount,
      monthsTerm: payload.monthsTerm,
      paymentMode: payload.paymentMode === 'fixed_term' ? 'FIXED_TERM' : 'FREE_PAYMENT',
      startDate: payload.startDate,
      endDate: payload.endDate,
      isIndefinite: payload.isIndefinite,
      userId
    };

    this.debtService.createDebt(request).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Error al guardar la deuda en la BD:', err);
      }
    });

    this.isModalOpen.set(false);
  }

  private mapToActiveDebt(d: Debt): ActiveDebt {
    const isInstallment = d.type === 'INSTALLMENT';
    const total = d.totalAmount || (d.monthlyAmount * (d.monthsTerm || 12));
    const paid = d.paidInstallments || 0;
    const term = d.monthsTerm || 12;
    const progressPct = term > 0 ? Math.round((paid / term) * 100) : 0;

    return {
      id: d.id || Date.now(),
      title: d.category,
      subtitle: isInstallment
        ? `Inicio ${d.startDate || ''} - ${d.endDate || ''}`
        : (d.isIndefinite ? 'Gasto Recurrente Indefinido' : `Hasta ${d.endDate || ''}`),
      monthlyPayment: `S/ ${d.monthlyAmount}/mes`,
      remainingAmount: `Quedan S/ ${total.toLocaleString()}`,
      progressText: isInstallment ? `Progreso ${paid}/${term}` : `${paid}/${term} cuotas`,
      percentage: progressPct,
      iconName: d.category.toLowerCase().includes('vehicular') || d.category.toLowerCase().includes('auto') ? 'car' : 'debts'
    };
  }
}
