import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyProfile } from '@core/evolution/models/evolution.model';

@Component({
  selector: 'app-evolution-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evolution-header.html'
})
export class EvolutionHeaderComponent {
  perfilMensual = input<MonthlyProfile[]>([]);
  selectedMonth = input<string | null>(null);
  monthSelected = output<string>();

  isOpen = signal<boolean>(false);

  activeProfile = computed(() => {
    const list = this.perfilMensual();
    const sel = this.selectedMonth();
    if (!list || list.length === 0) return null;
    return list.find(p => p.mes === sel) || list[list.length - 1];
  });

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  selectMonth(mes: string): void {
    this.monthSelected.emit(mes);
    this.isOpen.set(false);
  }

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
