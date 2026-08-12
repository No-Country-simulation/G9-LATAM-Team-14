import { Component, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent, IconName } from '@app/shared/icons/iconsFinCoach';

export interface GoalOption {
  id: string;
  title: string;
  icon: IconName;
}

@Component({
  selector: 'app-profile-goal-card',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './profile-goal-card.html',
})
export class ProfileGoalCardComponent {
  isEditing = input<boolean>(false);
  currentGoalObj = input<GoalOption>({ id: 'vivienda', title: 'Vivienda', icon: 'home' });
  tempSelectedGoal = model<string>('vivienda');
  goals = input<GoalOption[]>([]);

  selectGoal(id: string): void {
    this.tempSelectedGoal.set(id);
  }
}
