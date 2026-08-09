import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent, IconName } from '../../../../shared/icons/iconsFinCoach';
import { DebtService } from '@core/debts/services/debt.service';

export interface HabitOption {
  id: string;
  label: string;
  icon: IconName;
}

@Component({
  selector: 'app-step-about',
  standalone: true,
  imports: [FormsModule, IconFinCoachComponent],
  templateUrl: './step-about.html',
})
export class StepAboutComponent {
  private debtService = inject(DebtService);

  get income(): number | null {
    return this.debtService.onboardingIncome();
  }

  set income(val: number | null) {
    this.debtService.onboardingIncome.set(val);
  }

  selectedHabit = signal<string>('Nunca');

  habitOptions: HabitOption[] = [
    { id: 'Nunca', label: 'Nunca', icon: 'x-circle' },
    { id: 'Baja', label: 'Baja', icon: 'sprout' },
    { id: 'Media', label: 'Media', icon: 'pot' },
    { id: 'Alta', label: 'Alta', icon: 'forest' }
  ];

  selectHabit(id: string) {
    this.selectedHabit.set(id);
  }
}
