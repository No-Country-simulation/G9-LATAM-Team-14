import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StepAboutComponent, StepDebtsComponent, StepExpensesComponent, StepGoalsComponent } from './components';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    StepAboutComponent,
    StepDebtsComponent,
    StepExpensesComponent,
    StepGoalsComponent
  ],
  templateUrl: './onboarding.html',
})
export class Onboarding {
  private router = inject(Router);

  currentStep = 1;
  totalSteps = 4;

  steps: OnboardingStep[] = [
    { id: 1, label: 'Datos' },
    { id: 2, label: 'Endeudamiento' },
    { id: 3, label: 'Gastos' },
    { id: 4, label: 'Metas' },
  ];

  get progressPercentage(): number {
    if (this.steps.length <= 1) return 0;
    return ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.finishOnboarding();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  skipOnboarding() {
    this.router.navigate(['/dashboard']);
  }

  finishOnboarding() {
    this.router.navigate(['/dashboard']);
  }
}

export interface OnboardingStep {
  id: number;
  label: string;
}
