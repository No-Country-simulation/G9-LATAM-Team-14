import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/services/auth.service';
import { DebtService } from '@core/debts/services/debt.service';
import { Debt, DebtSummary } from '@core/debts/models/debt.model';
import { IconName } from '@app/shared/icons/iconsFinCoach';
import {
  ProfileHeaderComponent,
  ProfileGoalsIncomeCardComponent,
  ProfileDebtsCardComponent,
  DebtRatioCardComponent,
  SavingsFrequencyCardComponent,
  MonthlyProjectionCardComponent,
  type SavingsFrequency
} from './components';

export interface ProfileDebtView {
  id: number;
  category: string;
  subtitle: string;
  monthlyAmountText: string;
  iconName: IconName;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileHeaderComponent,
    ProfileGoalsIncomeCardComponent,
    ProfileDebtsCardComponent,
    DebtRatioCardComponent,
    SavingsFrequencyCardComponent,
    MonthlyProjectionCardComponent
  ],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  @ViewChild(ProfileGoalsIncomeCardComponent) goalsIncomeCard?: ProfileGoalsIncomeCardComponent;

  private authService = inject(AuthService);
  private debtService = inject(DebtService);

  monthlyIncome = signal<number>(4500);
  savingsFrequency = signal<SavingsFrequency>('media');

  summaryData = signal<DebtSummary>({
    totalPendingAmount: 9300,
    totalMonthlyPayment: 1125,
    incomePercentage: 25,
    estimatedFreeDate: 'Jun 2028',
    monthsRemaining: 23
  });

  activeDebts = signal<ProfileDebtView[]>([]);

  ngOnInit(): void {
    this.loadUserData();
  }

  onHeaderEditToggle(): void {
    this.goalsIncomeCard?.toggleEdit();
  }

  onHeaderSave(): void {
    this.goalsIncomeCard?.save();
  }

  onHeaderCancel(): void {
    this.goalsIncomeCard?.cancel();
  }

  loadUserData(): void {
    const user = this.authService.currentUser();
    const userId = user?.id || 1;

    // Cargar deudas activas
    this.debtService.getDebts('ACTIVE', userId).subscribe({
      next: (debts) => {
        if (debts && debts.length > 0) {
          this.activeDebts.set(debts.map(d => this.mapToProfileDebt(d)));
        } else {
          this.setDemoDebts();
        }
      },
      error: () => {
        this.setDemoDebts();
      }
    });

    // Cargar resumen
    this.debtService.getSummary(userId).subscribe({
      next: (summary) => {
        if (summary) {
          this.summaryData.set(summary);
        }
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
      }
    });
  }

  private setDemoDebts(): void {
    this.activeDebts.set([
      { id: 1, category: 'Tarjeta de crédito', subtitle: '6 de 12 cuotas', monthlyAmountText: '$ 400 /mes', iconName: 'debts' },
      { id: 2, category: 'Préstamo personal', subtitle: '8 de 12 cuotas', monthlyAmountText: '$ 500 /mes', iconName: 'briefcase' },
      { id: 3, category: 'Crédito vehicular', subtitle: '8 de 24 cuotas', monthlyAmountText: '$ 225 /mes', iconName: 'car' },
    ]);
  }

  private mapToProfileDebt(d: Debt): ProfileDebtView {
    const isInstallment = d.type === 'INSTALLMENT';
    const paid = d.paidInstallments || 0;
    const term = d.monthsTerm || 12;

    let icon: IconName = 'debts';
    const catLower = (d.category || '').toLowerCase();
    if (catLower.includes('vehicular') || catLower.includes('auto') || catLower.includes('car')) {
      icon = 'car';
    } else if (catLower.includes('hipotecario') || catLower.includes('casa') || catLower.includes('vivienda')) {
      icon = 'home';
    } else if (catLower.includes('préstamo') || catLower.includes('prestamo')) {
      icon = 'briefcase';
    }

    return {
      id: d.id || Date.now(),
      category: d.category,
      subtitle: isInstallment ? `${paid} de ${term} cuotas` : (d.isIndefinite ? 'Gasto Recurrente Indefinido' : `Hasta ${d.endDate || ''}`),
      monthlyAmountText: `$ ${d.monthlyAmount} /mes`,
      iconName: icon
    };
  }
}
