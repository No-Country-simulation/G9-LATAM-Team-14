import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent, IconName } from '@app/shared/icons/iconsFinCoach';

export interface ActiveDebt {
  id: number;
  title: string;
  subtitle: string;
  monthlyPayment: string;
  remainingAmount: string;
  progressText: string;
  percentage: number;
  iconName: IconName;
}

@Component({
  selector: 'app-active-debts-list',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './active-debts-list.html',
})
export class ActiveDebtsListComponent {
  debts = input.required<ActiveDebt[]>();
}
