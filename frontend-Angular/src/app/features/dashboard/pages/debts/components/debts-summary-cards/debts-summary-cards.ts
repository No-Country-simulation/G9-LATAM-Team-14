import { Component, input } from '@angular/core';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-debts-summary-cards',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './debts-summary-cards.html',
})
export class DebtsSummaryCardsComponent {
  totalPending = input<string>('$ 0');
  monthlyTotal = input<string>('$ 0');
  incomePercentage = input<string>('0%');
  freeDate = input<string>('-');
  monthsRemaining = input<number>(0);
}
