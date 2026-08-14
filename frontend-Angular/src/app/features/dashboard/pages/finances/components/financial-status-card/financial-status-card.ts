import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FactorObserved {
  name: string;
  assessment: string;
}

@Component({
  selector: 'app-financial-status-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-status-card.html'
})
export class FinancialStatusCard {
  @Input() status = 'calculated';
  @Input() currentState = '';
  @Input() trajectory = '';
  @Input() confidencePct = 0;
  @Input() daysWithHistory = 0;
  @Input() confirmedMovements = 0;
  @Input() dateRangeText = '';
  @Input() observedFactors: FactorObserved[] = [];
}
