import { Component, computed, input } from '@angular/core';
import { Score } from '@core/recommendations/models/recommendation.model';

@Component({
  selector: 'app-impact-projection-panel',
  standalone: true,
  imports: [],
  templateUrl: './impact-projection-panel.html',
})
export class ImpactProjectionPanelComponent {
  score = input.required<Score>();

  delta = computed(() => this.score().scorePotencial - this.score().scoreActual);
  currentPercent = computed(() => this.score().scoreActual);
  potentialPercent = computed(() => this.score().scorePotencial);
  pendingCount = computed(() => this.score().accionesTotales - this.score().accionesCompletadas);

  currentLabel = computed(() => this.scoreLabel(this.score().scoreActual));
  potentialLabel = computed(() => this.scoreLabel(this.score().scorePotencial));

  private scoreLabel(score: number): string {
    if (score >= 85) return 'Saludable';
    if (score >= 60) return 'En observación';
    return 'En riesgo';
  }
}
