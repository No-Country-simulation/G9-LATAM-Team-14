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
  @Input() confidencePct = 85;
  @Input() daysWithHistory = 60;
  @Input() confirmedMovements = 48;
  @Input() dateRangeText = '';
  @Input() observedFactors: FactorObserved[] = [];
}
