import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '@shared/icons/iconsFinCoach';
import { OnboardingService } from '@core/onboarding/services/onboarding.service';

@Component({
  selector: 'app-step-debts',
  standalone: true,
  imports: [FormsModule, IconFinCoachComponent],
  templateUrl: './step-debts.html',
})
export class StepDebtsComponent {
  private onboardingService = inject(OnboardingService);

  debts = this.onboardingService.onboardingDebts;

  totalDebt = computed(() => {
    return this.debts().reduce((acc, d) => acc + (d.amount || 0), 0);
  });

  income = computed(() => {
    return this.onboardingService.onboardingIncome() || 0;
  });

  debtPercentage = computed(() => {
    const total = this.totalDebt();
    const userIncome = this.income();
    if (total === 0) return 0;
    if (userIncome > 0) {
      return Math.min(Math.round((total / userIncome) * 100), 100);
    }
    return Math.min(Math.round((total / 3000) * 100), 100);
  });

  addDebt() {
    this.onboardingService.onboardingDebts.update(list => [
      ...list,
      { category: '', amount: null }
    ]);
  }

  removeDebt(index: number) {
    if (this.debts().length > 1) {
      this.onboardingService.onboardingDebts.update(list => list.filter((_, i) => i !== index));
    }
  }
}
