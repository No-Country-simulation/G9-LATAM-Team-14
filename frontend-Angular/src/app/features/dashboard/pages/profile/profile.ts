import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/services/auth.service';
import { DebtService } from '@core/debts/services/debt.service';
import { Debt, DebtSummary } from '@core/debts/models/debt.model';
import { IconName } from '@app/shared/icons/iconsFinCoach';

// Subcomponentes modularizados
import { ProfileHeaderComponent } from './components/profile-header/profile-header';
import { MonthlyIncomeCardComponent } from './components/monthly-income-card/monthly-income-card';
import { ProfileDebtsCardComponent } from './components/profile-debts-card/profile-debts-card';
import { DebtRatioCardComponent } from './components/debt-ratio-card/debt-ratio-card';
import { SavingsFrequencyCardComponent, SavingsFrequency } from './components/savings-frequency-card/savings-frequency-card';
import { MonthlyProjectionCardComponent } from './components/monthly-projection-card/monthly-projection-card';

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
    MonthlyIncomeCardComponent,
    ProfileDebtsCardComponent,
    DebtRatioCardComponent,
    SavingsFrequencyCardComponent,
    MonthlyProjectionCardComponent
  ],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
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
      { id: 1, category: 'Tarjeta de crédito', subtitle: '6 de 12 cuotas', monthlyAmountText: 'S/ 400 /mes', iconName: 'debts' },
      { id: 2, category: 'Préstamo personal', subtitle: '8 de 12 cuotas', monthlyAmountText: 'S/ 500 /mes', iconName: 'briefcase' },
      { id: 3, category: 'Crédito vehicular', subtitle: '8 de 24 cuotas', monthlyAmountText: 'S/ 225 /mes', iconName: 'car' },
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
      monthlyAmountText: `S/ ${d.monthlyAmount} /mes`,
      iconName: icon
    };
  }
}
