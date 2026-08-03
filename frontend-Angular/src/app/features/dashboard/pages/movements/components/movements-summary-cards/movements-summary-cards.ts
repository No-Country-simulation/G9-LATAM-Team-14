import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movement } from '@core/movements/models/movement.model';

@Component({
  selector: 'app-movements-summary-cards',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './movements-summary-cards.html'
})
export class MovementsSummaryCards {

  @Input() movements: Movement[] = [];

  // Valores temporales hasta conectar el backend
  readonly baseIncome = 4500;
  readonly fixedDebt = 1125;

  get totalIncome(): number {
    return this.movements
      .filter(m => m.type === 'INGRESO')
      .reduce((sum, m) => sum + m.amount, 0);
  }

  get totalExpense(): number {
    return this.movements
      .filter(m => m.type === 'GASTO')
      .reduce((sum, m) => sum + m.amount, 0);
  }
  get expensePercentage(): number {

    const totalIncome = this.baseIncome + this.totalIncome;

    if (totalIncome === 0) {
      return 0;
    }

    return Math.min(
      (this.totalExpense / totalIncome) * 100,
      100
    );

  }
  get incomeCount(): number {
    return this.movements.filter(m => m.type === 'INGRESO').length;
  }

  get incomeTotal(): number {
    return this.baseIncome + this.totalIncome;
  }

  get available(): number {
    return this.incomeTotal - this.totalExpense;
  }

}
