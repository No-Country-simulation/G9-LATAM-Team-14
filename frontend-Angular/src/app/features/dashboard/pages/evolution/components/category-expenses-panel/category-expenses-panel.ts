import { Component, computed, input } from '@angular/core';
import { CategoryExpense } from '@core/evolution/models/evolution.model';

const CATEGORY_COLORS: Record<string, string> = {
  'ALIMENTACIÓN': '#5A7259',
  'TRANSPORTE': '#7895B2',
  'OCIO': '#78583E',
  'OTROS': '#936124'
};

@Component({
  selector: 'app-category-expenses-panel',
  standalone: true,
  imports: [],
  templateUrl: './category-expenses-panel.html',
})
export class CategoryExpensesPanel {
  gastos = input<CategoryExpense[]>([]);
  total = input(0);
  variacion = input(0);
  ultimoMes = input('');

  mesActual = computed(() => this.longMonthLabel(this.ultimoMes()));
  mesAnterior = computed(() => this.shortMonthLabel(this.ultimoMes()));

  colorFor(categoria: string): string {
    return CATEGORY_COLORS[categoria.toUpperCase()] ?? '#5A7259';
  }

  private shortMonthLabel(mes: string): string {
    if (!mes) return '';
    const [, month] = mes.split('-').map(Number);
    return new Date(2000, month - 1, 1).toLocaleDateString('es-PE', { month: 'short' });
  }

  private longMonthLabel(mes: string): string {
    if (!mes) return '';
    const [year, month] = mes.split('-').map(Number);
    const label = new Date(year, month - 1, 1).toLocaleDateString('es-PE', { month: 'long' });
    return `${label.toUpperCase()} ${year}`;
  }
}
