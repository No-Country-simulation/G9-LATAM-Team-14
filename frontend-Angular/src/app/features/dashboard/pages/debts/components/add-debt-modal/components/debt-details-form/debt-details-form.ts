import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../form-controls/form-input';
import { getLocalDateString } from '@core/utils/date.utils';

export type PaymentMode = 'fixed_term' | 'free_payment';

@Component({
  selector: 'app-debt-details-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent
  ],
  templateUrl: './debt-details-form.html',
})
export class DebtDetailsFormComponent {
  category = model<string>('Crédito personal');
  totalAmount = model<number | null>(null);
  fixedTermMonths = model<number | null>(null);
  startDate = model<string>(getLocalDateString());

  categoryOptions = [
    'Crédito de vivienda',
    'Crédito educativo',
    'Tarjeta de crédito',
    'Crédito vehiculo',
    'Crédito personal'
  ];
}
