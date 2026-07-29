import { Component, input } from '@angular/core';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-debts-summary-cards',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './debts-summary-cards.html',
})
export class DebtsSummaryCardsComponent {
  totalPending = input<string>('S/ 9,300');
  monthlyTotal = input<string>('S/ 1,125');
  incomePercentage = input<string>('21%');
  freeDate = input<string>('Jun 2028');
  monthsRemaining = input<number>(23);
}
