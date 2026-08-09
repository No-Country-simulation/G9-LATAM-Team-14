import { Component, inject } from '@angular/core';
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

  currentStep = 1;
  totalSteps = 4;

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

  nextStep() {
    if (this.currentStep === 3 && !this.showAiModal) {
      this.showAiModal = true;
      return;
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.finishOnboarding();
    }
  }

  confirmAiModal() {
    this.showAiModal = false;
    this.currentStep = 4;
  }

  closeAiModal() {
    this.showAiModal = false;
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
