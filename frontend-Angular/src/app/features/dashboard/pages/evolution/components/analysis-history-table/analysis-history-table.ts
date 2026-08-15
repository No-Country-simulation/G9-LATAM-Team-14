import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisHistoryRow } from '@core/evolution/models/evolution.model';

@Component({
  selector: 'app-analysis-history-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analysis-history-table.html'
})
export class AnalysisHistoryTable {
  historial = input<AnalysisHistoryRow[]>([]);

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value || 0);
  }
}
