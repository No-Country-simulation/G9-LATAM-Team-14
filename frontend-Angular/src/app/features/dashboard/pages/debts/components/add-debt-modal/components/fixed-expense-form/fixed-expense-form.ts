import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../form-controls/form-input';
import { MonthPickerInputComponent } from '../form-controls/month-picker-input';

@Component({
  selector: 'app-fixed-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    MonthPickerInputComponent
  ],
  templateUrl: './fixed-expense-form.html',
})
export class FixedExpenseFormComponent {
  category = model<string>('Alquiler / Vivienda');
  monthlyAmount = model<number>(1200);
  isIndefinite = model<boolean>(false);
  monthsTerm = model<number>(12);
  startDate = model<string>('2026-07');

  categoryOptions = [
    'Alquiler / Vivienda',
    'Pensión / Educación',
    'Suscripciones',
    'Servicios básicos',
    'Otro'
  ];
}
