import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeVsExpensesPoint, MonthlyProfile } from '@core/evolution/models/evolution.model';

export interface ComparisonMetric {
  label: string;
  previous: number;
  current: number;
}

@Component({
  selector: 'app-recent-evolution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-evolution.html'
})
export class RecentEvolutionComponent {
  ingresosVsGastos = input<IncomeVsExpensesPoint[]>([]);
  perfilMensual = input<MonthlyProfile[]>([]);
  isLoading = input<boolean>(false);
  errorMessage = input<string | null>(null);

  previousPoint = computed(() => {
    const lista = this.ingresosVsGastos();
    return lista.length >= 2 ? lista[lista.length - 2] : lista[0] || null;
  });

  currentPoint = computed(() => {
    const lista = this.ingresosVsGastos();
    return lista.length >= 1 ? lista[lista.length - 1] : null;
  });

  previousProfile = computed(() => {
    const lista = this.perfilMensual();
    return lista.length >= 2 ? lista[lista.length - 2] : lista[0] || null;
  });

  currentProfile = computed(() => {
    const lista = this.perfilMensual();
    return lista.length >= 1 ? lista[lista.length - 1] : null;
  });

  metrics = computed<ComparisonMetric[]>(() => {
    const prev = this.previousPoint();
    const curr = this.currentPoint();

    const prevIncome = prev ? Number(prev.ingresos) : 0;
    const currIncome = curr ? Number(curr.ingresos) : 0;

    const prevExpenses = prev ? Number(prev.gastos) : 0;
    const currExpenses = curr ? Number(curr.gastos) : 0;

    const prevDebt = prev ? Number(prev.deudas) : 0;
    const currDebt = curr ? Number(curr.deudas) : 0;

    const prevBalance = prevIncome - prevExpenses - prevDebt;
    const currBalance = currIncome - currExpenses - currDebt;

    const prevSavings = Math.max(0, prevBalance);
    const currSavings = Math.max(0, currBalance);

    return [
      { label: 'Ingresos', previous: prevIncome, current: currIncome },
      { label: 'Gastos', previous: prevExpenses, current: currExpenses },
      { label: 'Pago de deudas', previous: prevDebt, current: currDebt },
      { label: 'Saldo disponible', previous: prevBalance, current: currBalance },
      { label: 'Capacidad de ahorro', previous: prevSavings, current: currSavings }
    ];
  });

  formatMonth(monthStr?: string): string {
    if (!monthStr) return 'N/D';
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[monthNum - 1] || parts[1]} ${year}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  }

  formatPercentage(value: number): string {
    return `${Math.abs(value).toFixed(1)}%`;
  }

  changePercentage(curr: number, prev: number): number | null {
    if (prev === 0) {
      if (curr === 0) return 0;
      return curr > 0 ? 100 : -100;
    }
    return ((curr - prev) / Math.abs(prev)) * 100;
  }

  comparisonWidth(valA: number, valB: number): number {
    const max = Math.max(Math.abs(valA), Math.abs(valB), 1);
    if (valA === 0) return 5;
    return Math.min(100, Math.max(10, (Math.abs(valA) / max) * 100));
  }

  formatStatus(status?: string): string {
    if (!status) return 'En evaluación';
    return status;
  }
}
