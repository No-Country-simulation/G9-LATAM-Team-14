import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent, IconName } from '@app/shared/icons/iconsFinCoach';
import { Debt } from '@app/core/debts/models/debt.model';

export interface ActiveDebt {
  id: number;
  title: string;
  subtitle: string;
  monthlyPayment: string;
  remainingAmount: string;
  progressText: string;
  percentage: number;
  iconName: IconName;
  raw?: Debt;
}

@Component({
  selector: 'app-active-debts-list',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './active-debts-list.html',
})
export class ActiveDebtsListComponent {
  debts = input.required<ActiveDebt[]>();
  edit = output<ActiveDebt>();
  delete = output<number>();
}
