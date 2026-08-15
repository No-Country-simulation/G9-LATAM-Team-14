import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent, IconName } from '../../../../shared/icons/iconsFinCoach';
import { OnboardingService } from '../../../../core/onboarding/services/onboarding.service';

export interface GoalOption {
  id: string;
  title: string;
  icon: IconName;
}

@Component({
  selector: 'app-step-goals',
  standalone: true,
  imports: [FormsModule, IconFinCoachComponent],
  templateUrl: './step-goals.html',
})
export class StepGoalsComponent {
  private onboardingService = inject(OnboardingService);

  selectedGoal = this.onboardingService.primaryGoal;
  hobbiesList = this.onboardingService.hobbiesList;
  workSupportList = this.onboardingService.workSupportList;

  newHobbyText = signal<string>('');
  newWorkSupportText = signal<string>('');

  goals: GoalOption[] = [
    { id: 'vehiculo', title: 'Vehículo', icon: 'car' },
    { id: 'vivienda', title: 'Vivienda', icon: 'home' },
    { id: 'viajes', title: 'Viajes', icon: 'plane' },
    { id: 'estudios', title: 'Estudios', icon: 'graduation' },
    { id: 'emergencia', title: 'Emergencia', icon: 'shield' },
    { id: 'otros', title: 'Otros', icon: 'flag' }
  ];

  selectGoal(id: string) {
    this.selectedGoal.set(id);
  }

  addHobby() {
    const text = this.newHobbyText().trim();
    if (text) {
      this.hobbiesList.update(list => [...list, text]);
      this.newHobbyText.set('');
    }
  }

  removeHobby(index: number) {
    this.hobbiesList.update(list => list.filter((_, i) => i !== index));
  }

  addWorkSupport() {
    const text = this.newWorkSupportText().trim();
    if (text) {
      this.workSupportList.update(list => [...list, text]);
      this.newWorkSupportText.set('');
    }
  }

  removeWorkSupport(index: number) {
    this.workSupportList.update(list => list.filter((_, i) => i !== index));
  }
}
