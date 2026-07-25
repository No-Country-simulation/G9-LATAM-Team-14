import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '../../../../shared/icons/iconsFinCoach';

export interface DebtItem {
  id: number;
  type: string;
  amount: number | null;
}

@Component({
  selector: 'app-step-debts',
  standalone: true,
  imports: [FormsModule, IconFinCoachComponent],
  templateUrl: './step-debts.html',
})
export class StepDebtsComponent {
  debts = signal<DebtItem[]>([
    { id: 1, type: '', amount: null }
  ]);

  debtPercentage = computed(() => {
    const total = this.debts().reduce((acc, d) => acc + (d.amount || 0), 0);
    if (total === 0) return 0;
    return Math.min(Math.round((total / 5000) * 100), 100);
  });

  addDebt() {
    this.debts.update(list => [
      ...list,
      { id: Date.now(), type: '', amount: null }
    ]);
  }

  removeDebt(id: number) {
    if (this.debts().length > 1) {
      this.debts.update(list => list.filter(d => d.id !== id));
    }
  }
}
