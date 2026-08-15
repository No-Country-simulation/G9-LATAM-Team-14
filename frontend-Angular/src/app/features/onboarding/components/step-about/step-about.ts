import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent, IconName } from '../../../../shared/icons/iconsFinCoach';
import { OnboardingService, SecondaryIncome } from '@core/onboarding/services/onboarding.service';

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
  private onboardingService = inject(OnboardingService);

  get income(): number | null {
    return this.onboardingService.onboardingIncome();
  }
  set income(val: number | null) {
    this.onboardingService.onboardingIncome.set(val);
  }

  get primaryActivity(): string {
    return this.onboardingService.primaryActivity();
  }
  set primaryActivity(val: string) {
    this.onboardingService.primaryActivity.set(val);
  }

  get primaryModality(): string {
    return this.onboardingService.primaryModality();
  }
  set primaryModality(val: string) {
    this.onboardingService.primaryModality.set(val);
  }

  secondaryIncomes = this.onboardingService.secondaryIncomes;

  modalityOptions: string[] = [
    'Fijo',
    'Variable',
    'Mixto',
    'Estacional',
    'Apoyo',
    'Sin ingresos'
  ];

  selectedHabit = this.onboardingService.savingHabit;

  habitOptions: HabitOption[] = [
    { id: 'nunca', label: 'Nunca', icon: 'x-circle' },
    { id: 'baja', label: 'Baja', icon: 'sprout' },
    { id: 'media', label: 'Media', icon: 'pot' },
    { id: 'alta', label: 'Alta', icon: 'forest' }
  ];

  selectHabit(id: string) {
    this.selectedHabit.set(id);
  }

  addSecondaryIncome() {
    this.onboardingService.secondaryIncomes.update(list => [
      ...list,
      { activity: '', modality: '' }
    ]);
  }

  removeSecondaryIncome(index: number) {
    this.onboardingService.secondaryIncomes.update(list => list.filter((_, i) => i !== index));
  }
}

