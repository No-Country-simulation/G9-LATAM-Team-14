import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyProfile } from '@core/evolution/models/evolution.model';

@Component({
  selector: 'app-score-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-line-chart.html'
})
export class ScoreLineChartComponent {
  @Input() perfilMensual: MonthlyProfile[] = [];
  @Input() ultimoMes: string = '';
  @Input() ultimoScore: number = 0;
}
