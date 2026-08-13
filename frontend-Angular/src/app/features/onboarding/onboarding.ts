import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StepAboutComponent, StepDebtsComponent, StepGoalsComponent } from './components';
import { OnboardingService } from '@core/onboarding/services/onboarding.service';
import { AuthService } from '@core/auth/services/auth.service';

interface OnboardingStep {
  id: number;
  label: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    StepAboutComponent,
    StepDebtsComponent,
    StepGoalsComponent
  ],
  templateUrl: './onboarding.html',
})
export class Onboarding {
  private router = inject(Router);
  private onboardingService = inject(OnboardingService);
  private authService = inject(AuthService);

  @ViewChild(StepAboutComponent) stepAboutComp?: StepAboutComponent;
  @ViewChild(StepDebtsComponent) stepDebtsComp?: StepDebtsComponent;
  @ViewChild(StepGoalsComponent) stepGoalsComp?: StepGoalsComponent;

  currentStep = 1;
  totalSteps = 3;
  validationError: string | null = null;

  steps: OnboardingStep[] = [
    { id: 1, label: 'Datos' },
    { id: 2, label: 'Endeudamiento' },
    { id: 3, label: 'Metas' },
  ];

  get progressPercentage(): number {
    if (this.steps.length <= 1) return 0;
    return ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
  }

  validateCurrentStep(): boolean {
    this.validationError = null;

    if (this.currentStep === 1) {
      const income = this.onboardingService.onboardingIncome();
      const activity = this.onboardingService.primaryActivity()?.trim();
      const modality = this.onboardingService.primaryModality()?.trim();

      if (!income || income <= 0) {
        this.validationError = 'Por favor, ingresa tu ingreso mensual neto para continuar.';
        return false;
      }
      if (!activity) {
        this.validationError = 'Por favor, ingresa tu actividad principal para continuar.';
        return false;
      }
      if (!modality) {
        this.validationError = 'Por favor, selecciona la modalidad de tu ingreso principal.';
        return false;
      }
    } else if (this.currentStep === 2) {
      const debts = this.onboardingService.onboardingDebts();
      const hasIncomplete = debts.some(d => (d.category && (!d.amount || d.amount <= 0)) || (!d.category && d.amount && d.amount > 0));
      if (hasIncomplete) {
        this.validationError = 'Por favor, selecciona la categoría y el monto de tus compromisos.';
        return false;
      }
      const hasValid = debts.some(d => d.category && d.amount && d.amount > 0);
      if (!hasValid) {
        this.validationError = 'Por favor, registra al menos un compromiso o deuda para continuar.';
        return false;
      }
    } else if (this.currentStep === 3) {
      const goal = (this.onboardingService.nextGoal() || this.onboardingService.primaryGoal())?.trim();
      if (!goal) {
        this.validationError = 'Por favor, selecciona o ingresa tu meta financiera para continuar.';
        return false;
      }
    }
    return true;
  }

  nextStep(): void {
    if (!this.validateCurrentStep()) return;

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.finishOnboarding();
    }
  }

  prevStep(): void {
    this.validationError = null;
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private finishOnboarding(): void {
    this.onboardingService.saveOnboardingData().subscribe({
      next: () => {
        const user = this.authService.currentUser();
        if (user) {
          user.onboardingCompleted = true;
          this.authService.setCurrentUser(user);
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error al guardar el onboarding:', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
