import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvolutionService } from '@core/evolution/services/evolution.service';
import { EvolutionData } from '@core/evolution/models/evolution.model';
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

  data = signal<EvolutionData | null>(null);
  selectedMonth = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  onSelectMonth(mes: string): void {
    this.selectedMonth.set(mes);
  }

  private load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.evolutionService.getEvolution().subscribe({
      next: (result) => {
        this.data.set(result);
        if (result && result.perfilMensual && result.perfilMensual.length > 0) {
          const defaultMes = result.ultimoMes || result.perfilMensual[result.perfilMensual.length - 1].mes;
          this.selectedMonth.set(defaultMes);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar evolución financiera:', err);
        this.errorMessage.set('No se pudieron cargar los datos de evolución.');
        this.isLoading.set(false);
      }
    });
  }
}
