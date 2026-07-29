import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '../../../../shared/icons/iconsFinCoach';

export interface ExpenseItem {
  id: number;
  description: string;
  amount: number | null;
}

@Component({
  selector: 'app-step-expenses',
  standalone: true,
  imports: [FormsModule, IconFinCoachComponent],
  templateUrl: './step-expenses.html',
})
export class StepExpensesComponent {
  expenses = signal<ExpenseItem[]>([
    { id: 1, description: '', amount: null },
    { id: 2, description: '', amount: null },
    { id: 3, description: '', amount: null }
  ]);

  addExpense() {
    this.expenses.update(list => [
      ...list,
      { id: Date.now(), description: '', amount: null }
    ]);
  }

  removeExpense(id: number) {
    if (this.expenses().length > 1) {
      this.expenses.update(list => list.filter(e => e.id !== id));
    }
  }
}
