import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalHeaderComponent } from './components/modal-header/modal-header';
import { ModalTypeSelectorComponent, RegistrationType } from './components/modal-type-selector/modal-type-selector';
import { DebtDetailsFormComponent, PaymentMode } from './components/debt-details-form/debt-details-form';
import { FixedExpenseFormComponent } from './components/fixed-expense-form/fixed-expense-form';
import { ModalSummaryComponent } from './components/modal-summary/modal-summary';
import { ModalFooterComponent } from './components/modal-footer/modal-footer';
import { Debt } from '@app/core/debts/models/debt.model';

export type { RegistrationType, PaymentMode };

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
    ModalTypeSelectorComponent,
    DebtDetailsFormComponent,
    FixedExpenseFormComponent,
    ModalSummaryComponent,
    ModalFooterComponent
  ],
  templateUrl: './add-debt-modal.html',
})
export class AddDebtModalComponent {
  isOpen = input<boolean>(false);
  debtToEdit = input<Debt | null>(null);
  closeModal = output<void>();
  addDebt = output<NewDebtPayload>();

  // Selector principal: 'installment' = Deuda o Crédito, 'fixed' = Gasto Fijo Recurrente
  registrationType = signal<RegistrationType>('installment');

  // CASO A: Deuda o Crédito
  installmentCategory = signal<string>('Préstamo Personal');
  installmentTotalAmount = signal<number>(6000);
  paymentMode = signal<PaymentMode>('fixed_term');
  fixedTermMonths = signal<number>(12);
  freePaymentMonthlyQuota = signal<number>(150);

  // CASO B: Gasto Fijo Recurrente
  fixedCategory = signal<string>('Alquiler / Vivienda');
  fixedMonthlyAmount = signal<number>(1200);
  isIndefinite = signal<boolean>(false);
  fixedMonthsTerm = signal<number>(12);

  // Compartido
  startDate = signal<string>('2026-07');
  userMonthlyIncome = signal<number>(5000);

  constructor() {
    effect(() => {
      const debt = this.debtToEdit();
      if (debt) {
        const isInstallment = debt.type === 'INSTALLMENT';
        this.registrationType.set(isInstallment ? 'installment' : 'fixed');
        if (isInstallment) {
          this.installmentCategory.set(debt.category || 'Préstamo Personal');
          this.installmentTotalAmount.set(debt.totalAmount || ((debt.monthlyAmount || 0) * (debt.monthsTerm || 12)));
          this.paymentMode.set(debt.paymentMode === 'FIXED_TERM' ? 'fixed_term' : 'free_payment');
          this.fixedTermMonths.set(debt.monthsTerm || 12);
          this.freePaymentMonthlyQuota.set(debt.monthlyAmount || 150);
        } else {
          this.fixedCategory.set(debt.category || 'Alquiler / Vivienda');
          this.fixedMonthlyAmount.set(debt.monthlyAmount || 1200);
          this.isIndefinite.set(!!debt.isIndefinite);
          this.fixedMonthsTerm.set(debt.monthsTerm || 12);
        }
        const rawDate = debt.startDate || '2026-07';
        const formattedDate = rawDate.length >= 7 ? rawDate.substring(0, 7) : rawDate;
        this.startDate.set(formattedDate);
      } else {
        this.registrationType.set('installment');
        this.installmentCategory.set('Préstamo Personal');
        this.installmentTotalAmount.set(6000);
        this.paymentMode.set('fixed_term');
        this.fixedTermMonths.set(12);
        this.freePaymentMonthlyQuota.set(150);
        this.fixedCategory.set('Alquiler / Vivienda');
        this.fixedMonthlyAmount.set(1200);
        this.isIndefinite.set(false);
        this.fixedMonthsTerm.set(12);
        this.startDate.set('2026-07');
      }
    });
  }

  // Cálculos dinámicos
  calculatedMonthlyQuota = computed(() => {
    if (this.registrationType() === 'installment') {
      const total = this.installmentTotalAmount() || 0;
      if (this.paymentMode() === 'fixed_term') {
        const months = this.fixedTermMonths() || 1;
        return months > 0 ? Math.round(total / months) : 0;
      } else {
        return this.freePaymentMonthlyQuota() || 0;
      }
    } else {
      return this.fixedMonthlyAmount() || 0;
    }
  });

  calculatedTermMonths = computed(() => {
    if (this.registrationType() === 'installment') {
      if (this.paymentMode() === 'fixed_term') {
        return this.fixedTermMonths() || 1;
      } else {
        const total = this.installmentTotalAmount() || 0;
        const quota = this.freePaymentMonthlyQuota() || 1;
        return quota > 0 ? Math.ceil(total / quota) : 0;
      }
    } else {
      return this.isIndefinite() ? undefined : (this.fixedMonthsTerm() || 1);
    }
  });

  calculatedEndDate = computed(() => {
    if (this.registrationType() === 'fixed' && this.isIndefinite()) {
      return 'Indefinido';
    }

    const months = this.calculatedTermMonths();
    if (!months || months <= 0) return 'N/A';

    const [yearStr, monthStr] = (this.startDate() || '2026-07').split('-');
    if (!yearStr || !monthStr) return 'N/A';

    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);

    month += months;
    year += Math.floor((month - 1) / 12);
    month = ((month - 1) % 12) + 1;

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const formattedDate = `${monthNames[month - 1]} ${year}`;
    return this.registrationType() === 'installment' && this.paymentMode() === 'free_payment'
      ? `${formattedDate} (${months} meses est.)`
      : formattedDate;
  });

  calculatedIncomePercentage = computed(() => {
    const income = this.userMonthlyIncome() || 1;
    const quota = this.calculatedMonthlyQuota();
    return Math.round((quota / income) * 100);
  });

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    const isInstallment = this.registrationType() === 'installment';
    const payload: NewDebtPayload = {
      id: this.debtToEdit()?.id,
      type: this.registrationType(),
      category: isInstallment ? this.installmentCategory() : this.fixedCategory(),
      totalAmount: isInstallment ? this.installmentTotalAmount() : undefined,
      monthlyAmount: this.calculatedMonthlyQuota(),
      monthsTerm: this.calculatedTermMonths(),
      paymentMode: isInstallment ? this.paymentMode() : undefined,
      startDate: this.startDate(),
      endDate: this.calculatedEndDate(),
      isIndefinite: !isInstallment ? this.isIndefinite() : false,
    };
    this.addDebt.emit(payload);
    this.onClose();
  }
}
