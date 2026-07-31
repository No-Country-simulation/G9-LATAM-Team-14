import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '@shared/icons/iconsFinCoach';
import { DebtService } from '@core/debts/services/debt.service';
import { SingleDebtItemRequest } from '@core/debts/models/debt.model';

@Component({
  selector: 'app-step-debts',
  standalone: true,
  imports: [FormsModule, IconFinCoachComponent],
  templateUrl: './step-debts.html',
})
export class StepDebtsComponent {
  private debtService = inject(DebtService);

  debts = this.debtService.onboardingDebts;

  debtPercentage = computed(() => {
    const total = this.debts().reduce((acc, d) => acc + (d.amount || 0), 0);
    if (total === 0) return 0;
    return Math.min(Math.round((total / 5000) * 100), 100);
  });

  addDebt() {
    this.debtService.onboardingDebts.update(list => [
      ...list,
      { category: '', amount: null }
    ]);
  }

  removeDebt(index: number) {
    if (this.debts().length > 1) {
      this.debtService.onboardingDebts.update(list => list.filter((_, i) => i !== index));
    }
  }
}
