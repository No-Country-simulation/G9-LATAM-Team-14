import { Component, signal } from '@angular/core';
import { IconFinCoachComponent, IconName } from '../../../../shared/icons/iconsFinCoach';

export interface GoalOption {
  id: string;
  title: string;
  icon: IconName;
}

@Component({
  selector: 'app-step-goals',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './step-goals.html',
})
export class StepGoalsComponent {
  selectedGoal = signal<string>('');

  goals: GoalOption[] = [
    { id: 'vehiculo', title: 'Comprar un vehículo', icon: 'car' },
    { id: 'vivienda', title: 'Cuota inicial de vivienda', icon: 'home' },
    { id: 'viajes', title: 'Viajes o Vacaciones', icon: 'plane' },
    { id: 'estudios', title: 'Estudios o Educación', icon: 'graduation' },
    { id: 'emergencia', title: 'Fondo de emergencia', icon: 'shield' },
    { id: 'negocio', title: 'Emprender un negocio', icon: 'briefcase' }
  ];

  selectGoal(id: string) {
    this.selectedGoal.set(id);
  }
}
