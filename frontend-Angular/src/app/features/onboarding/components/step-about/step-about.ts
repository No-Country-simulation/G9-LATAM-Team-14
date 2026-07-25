import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent, IconName } from '../../../../shared/icons/iconsFinCoach';

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
  income: number | null = null;
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
