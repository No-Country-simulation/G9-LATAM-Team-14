import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvolutionService } from '@core/evolution/services/evolution.service';
import { EvolutionData, TimeRange } from '@core/evolution/models/evolution.model';
import {
  EvolutionHeaderComponent,
  RecentEvolutionComponent,
  ScoreLineChartComponent,
  AnalysisHistoryTable
} from './components';

@Component({
  selector: 'app-evolution',
  standalone: true,
  imports: [
    CommonModule,
    EvolutionHeaderComponent,
    RecentEvolutionComponent,
    ScoreLineChartComponent,
    AnalysisHistoryTable
  ],
  templateUrl: './evolution.html',
})
export class Evolution implements OnInit {
  private evolutionService = inject(EvolutionService);

  range = signal<TimeRange>('6M');
  data = signal<EvolutionData | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.load();
  }

  onRangeChange(range: TimeRange): void {
    this.range.set(range);
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.evolutionService.getMock(this.range()).subscribe({
      next: (result) => {
        this.data.set(result);
        this.isLoading.set(false);
      }
    });
  }
}
