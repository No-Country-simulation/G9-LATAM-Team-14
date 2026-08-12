import { Component, inject, signal, OnInit, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';
import { OnboardingService, SecondaryIncome } from '@core/onboarding/services/onboarding.service';
import { GoalOption, IncomeModalityCardComponent, IncomeNetCardComponent, ProfileGoalCardComponent, ProfileHobbiesCardComponent, ProfileWorkSupportCardComponent } from './components';
export type { GoalOption };

@Component({
  selector: 'app-profile-goals-income-card',
  standalone: true,
  imports: [
    CommonModule,
    IncomeNetCardComponent,
    IncomeModalityCardComponent,
    ProfileGoalCardComponent,
    ProfileHobbiesCardComponent,
    ProfileWorkSupportCardComponent
  ],
  templateUrl: './profile-goals-income-card.html',
})
export class ProfileGoalsIncomeCardComponent implements OnInit {
  private onboardingService = inject(OnboardingService);

  // Binding bidireccional para ingreso mensual
  income = model<number>(4500);

  // Estado de edición
  isEditing = signal<boolean>(false);

  // Datos guardados
  primaryActivity = signal<string>('Ingeniero de Software');
  primaryModality = signal<string>('Fijo');
  secondaryIncomes = signal<SecondaryIncome[]>([]);
  selectedGoal = signal<string>('vivienda');
  hobbiesList = signal<string[]>(['Fotografía', 'Caminar', 'Gaming']);
  workSupportList = signal<string[]>(['Cursos de Finanzas', 'Certificaciones AWS']);

  // Datos temporales para modo edición
  tempIncome = signal<number>(4500);
  tempPrimaryActivity = signal<string>('');
  tempPrimaryModality = signal<string>('');
  tempSecondaryIncomes = signal<SecondaryIncome[]>([]);
  tempSelectedGoal = signal<string>('');
  tempHobbiesList = signal<string[]>([]);
  tempWorkSupportList = signal<string[]>([]);

  modalityOptions: string[] = [
    'Fijo',
    'Variable',
    'Mixto',
    'Estacional',
    'Apoyo',
    'Sin ingresos'
  ];

  goals: GoalOption[] = [
    { id: 'vehiculo', title: 'Vehículo', icon: 'car' },
    { id: 'vivienda', title: 'Vivienda', icon: 'home' },
    { id: 'viajes', title: 'Viajes', icon: 'plane' },
    { id: 'estudios', title: 'Estudios', icon: 'graduation' },
    { id: 'emergencia', title: 'Emergencia', icon: 'shield' },
    { id: 'otros', title: 'Otros', icon: 'flag' }
  ];

  ngOnInit(): void {
    const serviceIncome = this.onboardingService.onboardingIncome();
    if (serviceIncome !== null && serviceIncome !== undefined) {
      this.income.set(serviceIncome);
    }

    const serviceActivity = this.onboardingService.primaryActivity();
    if (serviceActivity) {
      this.primaryActivity.set(serviceActivity);
    }

    const serviceModality = this.onboardingService.primaryModality();
    if (serviceModality) {
      this.primaryModality.set(serviceModality);
    }

    const serviceSecondary = this.onboardingService.secondaryIncomes();
    if (serviceSecondary && serviceSecondary.length > 0) {
      this.secondaryIncomes.set([...serviceSecondary]);
    } else {
      this.secondaryIncomes.set([
        { activity: 'Clases particulares', modality: 'Variable' }
      ]);
    }

    const serviceGoal = this.onboardingService.primaryGoal();
    if (serviceGoal) {
      this.selectedGoal.set(serviceGoal);
    }

    const serviceHobbies = this.onboardingService.hobbiesList();
    if (serviceHobbies && serviceHobbies.length > 0) {
      this.hobbiesList.set([...serviceHobbies]);
    }

    const serviceWorkSupport = this.onboardingService.workSupportList();
    if (serviceWorkSupport && serviceWorkSupport.length > 0) {
      this.workSupportList.set([...serviceWorkSupport]);
    }
  }

  get currentGoalObj(): GoalOption {
    return this.goals.find(g => g.id === this.selectedGoal()) || { id: 'vivienda', title: 'Vivienda', icon: 'home' };
  }

  toggleEdit(): void {
    if (!this.isEditing()) {
      this.tempIncome.set(this.income());
      this.tempPrimaryActivity.set(this.primaryActivity());
      this.tempPrimaryModality.set(this.primaryModality());
      this.tempSecondaryIncomes.set(this.secondaryIncomes().map(s => ({ ...s })));
      this.tempSelectedGoal.set(this.selectedGoal());
      this.tempHobbiesList.set([...this.hobbiesList()]);
      this.tempWorkSupportList.set([...this.workSupportList()]);
      this.isEditing.set(true);
    } else {
      this.isEditing.set(false);
    }
  }

  save(): void {
    this.income.set(this.tempIncome());
    this.primaryActivity.set(this.tempPrimaryActivity());
    this.primaryModality.set(this.tempPrimaryModality());
    this.secondaryIncomes.set(this.tempSecondaryIncomes().map(s => ({ ...s })));
    this.selectedGoal.set(this.tempSelectedGoal());
    this.hobbiesList.set([...this.tempHobbiesList()]);
    this.workSupportList.set([...this.tempWorkSupportList()]);

    this.onboardingService.onboardingIncome.set(this.income());
    this.onboardingService.primaryActivity.set(this.primaryActivity());
    this.onboardingService.primaryModality.set(this.primaryModality());
    this.onboardingService.secondaryIncomes.set(this.secondaryIncomes());
    this.onboardingService.primaryGoal.set(this.selectedGoal());
    this.onboardingService.hobbiesList.set(this.hobbiesList());
    this.onboardingService.workSupportList.set(this.workSupportList());

    this.isEditing.set(false);
  }

  cancel(): void {
    this.isEditing.set(false);
  }
}
