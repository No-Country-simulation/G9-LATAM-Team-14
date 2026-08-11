import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-monthly-projection-card',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './monthly-projection-card.html',
})
export class MonthlyProjectionCardComponent {
  income = input<number>(0);
  debtPayment = input<number>(0);
  averageExpense = input<number>(1683);

  savingsCapacity = computed(() => {
    const cap = this.income() - this.debtPayment() - this.averageExpense();
    return cap > 0 ? cap : 0;
  });
}
