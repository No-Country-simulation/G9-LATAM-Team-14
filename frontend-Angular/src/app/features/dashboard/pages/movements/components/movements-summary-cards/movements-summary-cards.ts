import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movement } from '@core/movements/models/movement.model';
import { IconFinCoachComponent, IconName } from '@shared/icons/iconsFinCoach';

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  iconName: IconName;
}

@Component({
  selector: 'app-movements-summary-cards',
  standalone: true,
  imports: [
    CommonModule,
    IconFinCoachComponent
  ],
  templateUrl: './movements-summary-cards.html'
})
export class MovementsSummaryCards {
  @Input() movements: Movement[] = [];
  readonly baseIncome = 4500;

  get extraIncome(): number {
    return this.movements
      .filter(m => m.type === 'INGRESO')
      .reduce((sum, m) => sum + m.amount, 0);
  }

  get totalIncome(): number {
    return this.baseIncome + this.extraIncome;
  }

  get totalExpense(): number {
    return this.movements
      .filter(m => m.type === 'GASTO')
      .reduce((sum, m) => sum + m.amount, 0);
  }

  get balance(): number {
    return this.totalIncome - this.totalExpense;
  }

  get expensePercentage(): number {
    if (this.totalIncome === 0) return 0;
    return Math.min((this.totalExpense / this.totalIncome) * 100, 100);
  }

  get categoriesBreakdown(): CategoryBreakdown[] {
    const expenses = this.movements.filter(m => m.type === 'GASTO');
    if (expenses.length === 0) return [];

    const map = new Map<string, number>();
    for (const m of expenses) {
      const cat = m.category || 'OTRO';
      map.set(cat, (map.get(cat) || 0) + m.amount);
    }

    const total = this.totalExpense || 1;
    const list: CategoryBreakdown[] = [];

    map.forEach((amount, category) => {
      const pct = Math.round((amount / total) * 100);
      list.push({
        category,
        amount,
        percentage: pct,
        iconName: this.getIconName(category)
      });
    });

    return list.sort((a, b) => b.amount - a.amount);
  }

  getIconName(category: string): IconName {
    if (!category) return 'tag';
    switch (category.toUpperCase()) {
      case 'ALIMENTOS':
      case 'ALIMENTACION': return 'utensils';
      case 'TRANSPORTE': return 'car';
      case 'SALUD': return 'shield-heart';
      case 'ENTRETENIMIENTO':
      case 'OCIO': return 'gamepad';
      case 'EDUCACION': return 'graduation';
      case 'HOGAR': return 'home';
      case 'SERVICIOS': return 'zap';
      case 'COMPRAS': return 'shopping-bag';
      case 'SALARIO': return 'briefcase';
      case 'FREELANCE': return 'laptop';
      case 'BONO': return 'gift';
      case 'VENTA': return 'shopping-cart';
      case 'INVERSION': return 'evolution';
      case 'INTERESES': return 'landmark';
      default: return 'tag';
    }
  }

  exportCSV(): void {
    if (!this.movements || this.movements.length === 0) {
      alert('No hay movimientos para exportar.');
      return;
    }

    const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
    const rows = this.movements.map(m => [
      m.id || '',
      `"${m.date || ''}"`,
      `"${m.type || ''}"`,
      `"${m.category || ''}"`,
      `"${(m.description || '').replace(/"/g, '""')}"`,
      m.amount || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `movimientos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


