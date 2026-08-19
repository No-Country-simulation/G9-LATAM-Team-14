import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

export type MonthlyPaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING';

export interface MonthlyDebtPayment {
  id: number;
  title: string;
  paidAmount: number;
  monthlyAmount: number;
  percentage: number;
  status: MonthlyPaymentStatus;
}

@Component({
  selector: 'app-monthly-debt-status-list',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './paid-debts-list.html',
})
export class MonthlyDebtStatusListComponent {
  payments = input.required<MonthlyDebtPayment[]>();
  monthLabel = input.required<string>();

  statusLabel(status: MonthlyPaymentStatus): string {
    if (status === 'PAID') return 'Pago realizado';
    if (status === 'PARTIAL') return 'Pago parcial';
    return 'Pago pendiente';
  }
}
