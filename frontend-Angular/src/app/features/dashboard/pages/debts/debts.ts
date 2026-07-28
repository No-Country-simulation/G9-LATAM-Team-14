import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebtsHeaderComponent } from './components/debts-header/debts-header';
import { DebtsSummaryCardsComponent } from './components/debts-summary-cards/debts-summary-cards';
import { ActiveDebtsListComponent, ActiveDebt } from './components/active-debts-list/active-debts-list';
import { DebtProjectionChartComponent } from './components/debt-projection-chart/debt-projection-chart';
import { PaidDebtsListComponent, PaidDebt } from './components/paid-debts-list/paid-debts-list';
import { AddDebtModalComponent, NewDebtPayload } from './components/add-debt-modal/add-debt-modal';

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
export class Debts {
  isModalOpen = signal<boolean>(false);

  // Deudas Activas
  activeDebts: ActiveDebt[] = [
    {
      id: 1,
      title: 'Préstamo personal',
      subtitle: 'Ene 2026 - Dic 2028',
      monthlyPayment: 'S/ 500/mes',
      remainingAmount: 'Quedan S/ 3,000',
      progressText: 'Progreso 6/12',
      percentage: 50,
      iconName: 'debts'
    },
    {
      id: 2,
      title: 'Tarjeta de crédito',
      subtitle: 'BanBif Oro',
      monthlyPayment: 'S/ 400/mes',
      remainingAmount: 'Quedan S/ 2,400',
      progressText: '4/10 cuotas',
      percentage: 40,
      iconName: 'debts'
    },
    {
      id: 3,
      title: 'Crédito vehicular',
      subtitle: 'Toyota RAV4',
      monthlyPayment: 'S/ 225/mes',
      remainingAmount: 'Quedan S/ 3,600',
      progressText: '8/24 cuotas',
      percentage: 33,
      iconName: 'car'
    }
  ];

  // Deudas Pagadas
  paidDebts: PaidDebt[] = [
    { id: 1, title: 'Crédito educativo', date: 'Mar 2026' },
    { id: 2, title: 'Electrodomésticos - Tienda', date: 'Dic 2025' },
    { id: 3, title: 'Préstamo Rápido Online', date: 'Nov 2025' }
  ];

  onAddDebt(): void {
    this.isModalOpen.set(true);
  }

  onCloseModal(): void {
    this.isModalOpen.set(false);
  }

  onSaveDebt(payload: NewDebtPayload): void {
    const isInstallment = payload.type === 'installment';
    const total = payload.totalAmount || (payload.monthlyAmount * (payload.monthsTerm || 12));
    
    const newDebt: ActiveDebt = {
      id: Date.now(),
      title: payload.category,
      subtitle: isInstallment ? `Inicio ${payload.startDate} - ${payload.endDate}` : (payload.isIndefinite ? 'Gasto Recurrente Indefinido' : `Hasta ${payload.endDate}`),
      monthlyPayment: `S/ ${payload.monthlyAmount}/mes`,
      remainingAmount: `Quedan S/ ${total.toLocaleString()}`,
      progressText: isInstallment ? `Progreso 1/${payload.monthsTerm}` : '1/12 cuotas',
      percentage: 10,
      iconName: payload.category.toLowerCase().includes('vehicular') || payload.category.toLowerCase().includes('auto') ? 'car' : 'debts'
    };

    this.activeDebts = [newDebt, ...this.activeDebts];
    this.isModalOpen.set(false);
  }
}
