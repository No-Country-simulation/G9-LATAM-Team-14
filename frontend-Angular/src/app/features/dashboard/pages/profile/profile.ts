import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/services/auth.service';
import { DebtService } from '@core/debts/services/debt.service';
import { ProfileService } from '@core/profile/services/profile.service';
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
  private profileService = inject(ProfileService);

  monthlyIncome = signal<number>(4500);
  savingsFrequency = signal<SavingsFrequency>('media');

  summaryData = signal<DebtSummary>({
    totalPendingAmount: 0,
    totalMonthlyPayment: 0,
    incomePercentage: 0,
    estimatedFreeDate: '-',
    monthsRemaining: 0
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
    const userId = user?.id;

    if (user?.ingresoMensual !== undefined && user?.ingresoMensual !== null) {
      this.monthlyIncome.set(user.ingresoMensual);
    }
    if (user?.frecuenciaAhorro) {
      this.savingsFrequency.set(user.frecuenciaAhorro.toLowerCase() as SavingsFrequency);
    }

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          if (profile.ingresoMensual !== undefined && profile.ingresoMensual !== null) {
            this.monthlyIncome.set(profile.ingresoMensual);
          }
          if (profile.frecuenciaAhorro) {
            this.savingsFrequency.set(profile.frecuenciaAhorro.toLowerCase() as SavingsFrequency);
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
      }
    });

    this.debtService.getDebts('ACTIVE', userId).subscribe({
      next: (debts) => {
        if (debts && debts.length > 0) {
          this.activeDebts.set(debts.slice(0, 5).map(d => this.mapToProfileDebt(d)));
        } else {
          this.activeDebts.set([]);
        }
      },
      error: (err) => {
        console.error('Error al cargar deudas activas en perfil:', err);
        this.activeDebts.set([]);
      }
    });

    this.debtService.getSummary(userId).subscribe({
      next: (summary) => {
        if (summary) {
          this.summaryData.set(summary);
        }
      },
      error: (err) => {
        console.error('Error al cargar resumen en perfil:', err);
      }
    });
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
