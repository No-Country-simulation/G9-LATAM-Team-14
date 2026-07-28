import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../form-controls/form-input';
import { MonthPickerInputComponent } from '../form-controls/month-picker-input';

export type PaymentMode = 'fixed_term' | 'free_payment';

@Component({
  selector: 'app-debt-details-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    MonthPickerInputComponent
  ],
  templateUrl: './debt-details-form.html',
})
export class DebtDetailsFormComponent {
  category = model<string>('Préstamo Personal');
  totalAmount = model<number>(6000);
  paymentMode = model<PaymentMode>('fixed_term');
  fixedTermMonths = model<number>(12);
  freePaymentMonthlyQuota = model<number>(150);
  startDate = model<string>('2026-07');

  categoryOptions = [
    'Préstamo Personal',
    'Tarjeta de Crédito',
    'Crédito Vehicular',
    'Crédito Hipotecario',
    'Préstamo Familiar / Informal',
    'Otro'
  ];
}
