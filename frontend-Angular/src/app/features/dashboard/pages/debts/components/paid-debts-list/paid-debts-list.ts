import { Component, input } from '@angular/core';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

export interface PaidDebt {
  id: number;
  title: string;
  date: string;
}

@Component({
  selector: 'app-paid-debts-list',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './paid-debts-list.html',
})
export class PaidDebtsListComponent {
  paidDebts = input.required<PaidDebt[]>();
}
