import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '@shared/icons/iconsFinCoach';

@Component({
  selector: 'app-step-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, IconFinCoachComponent],
  templateUrl: './step-expenses.html',
})
export class StepExpensesComponent {
  date: string = new Date().toISOString().split('T')[0];
  time: string = new Date().toTimeString().slice(0, 5);
  type: 'EGRESO' | 'INGRESO' = 'EGRESO';
  description: string = '';
  amount: number | null = null;
  note: string = '';
}



