import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StepAboutComponent, StepDebtsComponent, StepExpensesComponent, StepGoalsComponent } from './components';
import { DebtService } from '@core/debts/services/debt.service';
import { AuthService } from '@core/auth/services/auth.service';
import { AiClassificationModalComponent, CategoryOption } from '@shared/components/ai-classification-modal/ai-classification-modal';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    StepAboutComponent,
    StepDebtsComponent,
    StepExpensesComponent,
    StepGoalsComponent,
    AiClassificationModalComponent
  ],
  templateUrl: './onboarding.html',
})
export class Onboarding {
  private router = inject(Router);
  private debtService = inject(DebtService);
  private authService = inject(AuthService);

  @ViewChild(StepAboutComponent) stepAboutComp?: StepAboutComponent;
  @ViewChild(StepDebtsComponent) stepDebtsComp?: StepDebtsComponent;
  @ViewChild(StepExpensesComponent) stepExpensesComp?: StepExpensesComponent;
  @ViewChild(StepGoalsComponent) stepGoalsComp?: StepGoalsComponent;

  currentStep = 1;
  totalSteps = 4;
  validationError: string | null = null;

  // Estado del modal de confirmación de IA
  showAiModal = false;
  selectedCategory = 'Trabajo independiente';
  selectedRegularity = 'Variable';

  categories: CategoryOption[] = [
    { name: 'Trabajo independiente', confidence: '60.27%' },
    { name: 'Ingresos laborales', confidence: '17.68%' },
    { name: 'Otra / ambigua', confidence: '8.11%' },
    { name: 'Vestimenta', confidence: '2.75%' },
  ];

  steps: OnboardingStep[] = [
    { id: 1, label: 'Datos' },
    { id: 2, label: 'Endeudamiento' },
    { id: 3, label: 'Movimiento' },
    { id: 4, label: 'Metas' },
  ];

  get progressPercentage(): number {
    if (this.steps.length <= 1) return 0;
    return ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
  }

  validateCurrentStep(): boolean {
    this.validationError = null;

    if (this.currentStep === 1) {
      const income = this.debtService.onboardingIncome();
      if (!income || income <= 0) {
        this.validationError = 'Por favor, ingresa tu ingreso mensual neto para continuar.';
        return false;
      }
    } else if (this.currentStep === 2) {
      const debts = this.debtService.onboardingDebts();
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
      const expComp = this.stepExpensesComp;
      if (expComp) {
        if (!expComp.description || !expComp.description.trim()) {
          this.validationError = 'Por favor, ingresa la descripción del movimiento.';
          return false;
        }
        if (!expComp.amount || expComp.amount <= 0) {
          this.validationError = 'Por favor, ingresa un valor válido para el movimiento.';
          return false;
        }
      }
    } else if (this.currentStep === 4) {
      const goalComp = this.stepGoalsComp;
      if (goalComp && !goalComp.selectedGoal()) {
        this.validationError = 'Por favor, selecciona una meta para continuar.';
        return false;
      }
    }

    return true;
  }

  nextStep() {
    if (!this.validateCurrentStep()) {
      return;
    }
    if (this.currentStep === 3 && !this.showAiModal) {
      this.showAiModal = true;
      return;
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.validationError = null;
    } else {
      this.finishOnboarding();
    }
  }

  confirmAiModal() {
    this.showAiModal = false;
    this.currentStep = 4;
    this.validationError = null;
  }

  closeAiModal() {
    this.showAiModal = false;
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.validationError = null;
    }
  }

  skipOnboarding() {
    this.router.navigate(['/dashboard']);
  }

  finishOnboarding() {
    const userId = this.authService.currentUser()?.id || 1;
    this.debtService.saveOnboardingDebtsToBackend(userId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error guardando deudas de onboarding:', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }
}


export interface OnboardingStep {
  id: number;
  label: string;
}
