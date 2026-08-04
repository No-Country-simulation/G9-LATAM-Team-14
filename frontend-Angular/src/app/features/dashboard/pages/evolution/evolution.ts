import { Component, inject, OnInit, signal } from '@angular/core';
import { EvolutionService } from '@core/evolution/services/evolution.service';
import { EvolutionData, TimeRange } from '@core/evolution/models/evolution.model';
import { EvolutionHeaderComponent } from './components/evolution-header/evolution-header';
import { ScoreLineChartComponent } from './components/score-line-chart/score-line-chart';
import { IncomeExpensesChartComponent } from './components/income-expenses-chart/income-expenses-chart';
import { CategoryExpensesPanel } from './components/category-expenses-panel/category-expenses-panel';
import { AnalysisHistoryTable } from './components/analysis-history-table/analysis-history-table';

@Component({
  selector: 'app-evolution',
  standalone: true,
  imports: [
    EvolutionHeaderComponent,
    ScoreLineChartComponent,
    IncomeExpensesChartComponent,
    CategoryExpensesPanel,
    AnalysisHistoryTable
  ],
  templateUrl: './evolution.html',
})
export class Evolution implements OnInit {
  private evolutionService = inject(EvolutionService);

  range = signal<TimeRange>('6M');
  data = signal<EvolutionData | null>(null);

  ngOnInit(): void {
    this.load();
  }

  onRangeChange(range: TimeRange): void {
    this.range.set(range);
    this.load();
  }

  private load(): void {
    this.evolutionService.getMock(this.range()).subscribe(result => {
      this.data.set(result);
    });
  }
}
