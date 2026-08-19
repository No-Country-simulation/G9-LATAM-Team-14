import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalHeaderComponent } from './components/modal-header/modal-header';
import { DebtDetailsFormComponent } from './components/debt-details-form/debt-details-form';
import { ModalFooterComponent } from './components/modal-footer/modal-footer';
import { Debt } from '@app/core/debts/models/debt.model';
import { getLocalDateString } from '@core/utils/date.utils';

export type RegistrationType = 'installment' | 'fixed';
export type PaymentMode = 'fixed_term' | 'free_payment';

export interface NewDebtPayload {
  id?: number;
  type: RegistrationType;
  category: string;
  totalAmount?: number;
  monthlyAmount: number;
  monthsTerm?: number;
  paymentMode?: PaymentMode;
  startDate: string;
  endDate?: string;
  isIndefinite?: boolean;
}

@Component({
  selector: 'app-add-debt-modal',
  standalone: true,
  imports: [
    CommonModule,
    ModalHeaderComponent,
    DebtDetailsFormComponent,
    ModalFooterComponent
  ],
  templateUrl: './add-debt-modal.html',
})
export class AddDebtModalComponent {
  isOpen = input<boolean>(false);
  debtToEdit = input<Debt | null>(null);
  closeModal = output<void>();
  addDebt = output<NewDebtPayload>();
  installmentCategory = signal<string>('Crédito personal');
  installmentTotalAmount = signal<number | null>(null);
  fixedTermMonths = signal<number | null>(null);
  startDate = signal<string>(getLocalDateString());

  constructor() {
    effect(() => {
      const debt = this.debtToEdit();
      const todayStr = getLocalDateString();
      if (debt) {
        this.installmentCategory.set(debt.category || 'Crédito personal');
        this.installmentTotalAmount.set(debt.totalAmount || ((debt.monthlyAmount || 0) * (debt.monthsTerm || 12)));
        this.fixedTermMonths.set(debt.monthsTerm || 12);
        const rawDate = debt.startDate || todayStr;
        let formattedDate = rawDate;
        if (rawDate.length === 7) {
          formattedDate = `${rawDate}-01`;
        } else if (rawDate.length > 10) {
          formattedDate = rawDate.substring(0, 10);
        }
        this.startDate.set(formattedDate);
      } else {
        this.installmentCategory.set('Crédito personal');
        this.installmentTotalAmount.set(null);
        this.fixedTermMonths.set(null);
        this.startDate.set(todayStr);
      }
    });
  }

  calculatedMonthlyQuota = computed(() => {
    const total = this.installmentTotalAmount() || 0;
    const months = this.fixedTermMonths() || 1;
    if (months <= 0 || total <= 0) return 0;
    const monthlyRate = Math.pow(1 + this.annualEffectiveRate() / 100, 1 / 12) - 1;
    if (monthlyRate === 0) return Math.round(total / months);
    const factor = Math.pow(1 + monthlyRate, months);
    return Math.round(total * monthlyRate * factor / (factor - 1));
  });

  annualEffectiveRate = computed(() => {
    const category = this.installmentCategory().toLowerCase();
    if (category.includes('vivienda')) return 10;
    if (category.includes('educativo')) return 12;
    if (category.includes('tarjeta')) return 24;
    if (category.includes('vehiculo') || category.includes('vehículo')) return 16;
    return 18;
  });

  calculatedEndDate = computed(() => {
    const months = this.fixedTermMonths() || 1;
    if (!months || months <= 0) return 'N/A';
    const parts = (this.startDate() || getLocalDateString()).split('-');
    if (parts.length < 2) return 'N/A';
    const yearStr = parts[0];
    const monthStr = parts[1];
    const dayStr = parts[2] ? parts[2] : '01';

    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);
    let day = parseInt(dayStr, 10);

    month += months;
    year += Math.floor((month - 1) / 12);
    month = ((month - 1) % 12) + 1;

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return `${day} ${monthNames[month - 1]} ${year}`;
  });

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    const payload: NewDebtPayload = {
      id: this.debtToEdit()?.id,
      type: 'installment',
      category: this.installmentCategory(),
      totalAmount: this.installmentTotalAmount() || undefined,
      monthlyAmount: this.calculatedMonthlyQuota(),
      monthsTerm: this.fixedTermMonths() || undefined,
      paymentMode: 'fixed_term',
      startDate: this.startDate(),
      endDate: this.calculatedEndDate(),
      isIndefinite: false,
    };
    this.addDebt.emit(payload);
    this.onClose();
  }
}
