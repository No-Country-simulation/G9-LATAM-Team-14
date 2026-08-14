import { Component, inject, signal, OnInit, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingService, SecondaryIncome } from '@core/onboarding/services/onboarding.service';
import { AuthService } from '@core/auth/services/auth.service';
import { ProfileService } from '@core/profile/services/profile.service';
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
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  income = model<number>(4500);
  isEditing = signal<boolean>(false);
  primaryActivity = signal<string>('');
  primaryModality = signal<string>('Fijo');
  secondaryIncomes = signal<SecondaryIncome[]>([]);
  selectedGoal = signal<string>('vivienda');
  hobbiesList = signal<string[]>([]);
  workSupportList = signal<string[]>([]);
  tempIncome = signal<number>(4500);
  tempPrimaryActivity = signal<string>('');
  tempPrimaryModality = signal<string>('Fijo');
  tempSecondaryIncomes = signal<SecondaryIncome[]>([]);
  tempSelectedGoal = signal<string>('vivienda');
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
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          if (profile.ingresoMensual !== undefined && profile.ingresoMensual !== null) {
            this.income.set(profile.ingresoMensual);
          }
          if (profile.actividadPrincipal) {
            this.primaryActivity.set(profile.actividadPrincipal);
          }
          if (profile.primaryIncomeModality) {
            const m = profile.primaryIncomeModality;
            this.primaryModality.set(m.charAt(0).toUpperCase() + m.slice(1));
          }
          if (profile.nextGoal) {
            this.selectedGoal.set(profile.nextGoal);
          }
          if (profile.hobbies && profile.hobbies.length > 0) {
            this.hobbiesList.set(profile.hobbies);
          }
          if (profile.financialResponsibility) {
            this.workSupportList.set(profile.financialResponsibility.split(',').map(s => s.trim()).filter(Boolean));
          }
        }
      },
      error: () => {
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
    });
  }

  get currentGoalObj(): GoalOption {
    return this.goals.find(g => g.id === this.selectedGoal()) || { id: 'vivienda', title: 'Vivienda', icon: 'home' };
  }

  toggleEdit(): void {
    if (!this.isEditing()) {
      const currentInc = this.income();
      this.tempIncome.set(currentInc !== undefined && currentInc !== null ? currentInc : 4500);
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
    const currentInc = this.tempIncome();
    this.income.set(currentInc);
    this.primaryActivity.set(this.tempPrimaryActivity());
    this.primaryModality.set(this.tempPrimaryModality());
    this.secondaryIncomes.set(this.tempSecondaryIncomes().map(s => ({ ...s })));
    this.selectedGoal.set(this.tempSelectedGoal());
    this.hobbiesList.set([...this.tempHobbiesList()]);
    this.workSupportList.set([...this.tempWorkSupportList()]);

    this.onboardingService.onboardingIncome.set(currentInc);
    this.onboardingService.primaryActivity.set(this.primaryActivity());
    this.onboardingService.primaryModality.set(this.primaryModality());
    this.onboardingService.secondaryIncomes.set(this.secondaryIncomes());
    this.onboardingService.primaryGoal.set(this.selectedGoal());
    this.onboardingService.hobbiesList.set(this.hobbiesList());
    this.onboardingService.workSupportList.set(this.workSupportList());

    const payload = {
      monthlyNetIncome: currentInc,
      primaryActivity: this.primaryActivity(),
      primaryIncomeModality: this.primaryModality(),
      nextGoal: this.selectedGoal(),
      hobbies: this.hobbiesList(),
      financialResponsibility: this.workSupportList().join(', '),
      savingHabit: this.onboardingService.savingHabit() || 'media'
    };

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        this.authService.checkSession().subscribe();
      },
      error: (err) => {
        console.error('Error al actualizar el perfil en /api/v1/profile:', err);
      }
    });

    this.isEditing.set(false);
  }

  cancel(): void {
    this.isEditing.set(false);
  }
}
