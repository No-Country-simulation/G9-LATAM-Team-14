import { Component, input } from '@angular/core';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';
import { AnalysisHistoryRow, EstadoFinanciero } from '@core/evolution/models/evolution.model';

@Component({
  selector: 'app-analysis-history-table',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './analysis-history-table.html',
})
export class AnalysisHistoryTable {
  historial = input<AnalysisHistoryRow[]>([]);

  pillClass(estado: EstadoFinanciero): string {
    switch (estado) {
      case 'Saludable':
        return 'bg-[#5A7259]/15 text-[#425942] border-[#5A7259]/40';
      case 'En observación':
        return 'bg-[#936124]/15 text-[#77490C] border-[#936124]/40';
      case 'En riesgo':
        return 'bg-[#FFDAD6] text-[#BA1A1A] border-[#BA1A1A]/40';
      default:
        return 'bg-[#5A7259]/15 text-[#425942] border-[#5A7259]/40';
    }
  }
}
