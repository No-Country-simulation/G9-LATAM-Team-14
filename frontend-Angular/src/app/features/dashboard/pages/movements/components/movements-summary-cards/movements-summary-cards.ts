import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movement } from '../../../../../../models/movement.model';

@Component({
  selector: 'app-movements-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movements-summary-cards.html'
})
export class MovementsSummaryCards {

  @Input() movements: Movement[] = [];

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

  get balance(): number {
    return this.totalIncome - this.totalExpense;
  }

}
