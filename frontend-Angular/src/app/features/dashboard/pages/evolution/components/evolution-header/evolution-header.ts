import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeVsExpensesPoint, MonthlyProfile } from '@core/evolution/models/evolution.model';

@Component({
  selector: 'app-evolution-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evolution-header.html'
})
export class EvolutionHeaderComponent {
  @Input() perfilMensual: MonthlyProfile[] = [];
  @Input() ingresosVsGastos: IncomeVsExpensesPoint[] = [];

  previousProfile = computed(() => {
    if (this.perfilMensual.length >= 2) {
      return this.perfilMensual[this.perfilMensual.length - 2];
    }
    return this.perfilMensual[0] || null;
  });

  currentProfile = computed(() => {
    if (this.perfilMensual.length >= 1) {
      return this.perfilMensual[this.perfilMensual.length - 1];
    }
    return null;
  });

  formatMonth(monthStr?: string): string {
    if (!monthStr) return '';
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
}
