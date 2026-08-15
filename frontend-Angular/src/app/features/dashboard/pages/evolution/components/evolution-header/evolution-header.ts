import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeVsExpensesPoint, MonthlyProfile } from '@core/evolution/models/evolution.model';

@Component({
  selector: 'app-evolution-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evolution-header.html'
})
export class EvolutionHeaderComponent {
  perfilMensual = input<MonthlyProfile[]>([]);
  ingresosVsGastos = input<IncomeVsExpensesPoint[]>([]);

  previousProfile = computed(() => {
    const lista = this.perfilMensual();
    if (lista.length >= 2) return lista[lista.length - 2];
    return lista[0] || null;
  });

  currentProfile = computed(() => {
    const lista = this.perfilMensual();
    if (lista.length >= 1) return lista[lista.length - 1];
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
