import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyProfile } from '@core/evolution/models/evolution.model';

@Component({
  selector: 'app-score-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-line-chart.html'
})
export class ScoreLineChartComponent {
  perfilMensual = input<MonthlyProfile[]>([]);
  ultimoMes = input<string>('');
  ultimoScore = input<number>(0);
}
