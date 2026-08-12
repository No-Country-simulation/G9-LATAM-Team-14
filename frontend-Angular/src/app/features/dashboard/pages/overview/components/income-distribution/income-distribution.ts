import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BreakdownItem {
  label: string;
  percentage: string;
  color: string;
}

@Component({
  selector: 'app-income-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-distribution.html',
})
export class IncomeDistribution {
  // Circunferencia del círculo SVG (r=45 -> 2 * PI * 45 = 282.74)
  readonly circumference = 282.74;

  // 1. Distribución de Ingresos
  incomeTotal = signal<string>('$ 1.200');
  incomeFixedPct = signal<number>(100);
  incomeVarPct = signal<number>(0);

  // 2. Distribución del Gasto
  expenseTotal = signal<string>('$ 8');
  expenseFixedPct = signal<number>(0);
  expenseVarPct = signal<number>(100);

  getIncomeOffset(pct: number): number {
    return this.circumference - (this.circumference * pct) / 100;
  }

  getExpenseOffset(pct: number): number {
    return this.circumference - (this.circumference * pct) / 100;
  }
}
