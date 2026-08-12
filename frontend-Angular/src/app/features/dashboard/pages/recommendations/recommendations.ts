import { Component, inject, OnInit, signal } from '@angular/core';
import { RecommendationService } from '@core/recommendations/services/recommendation.service';
import { Recommendation, Score } from '@core/recommendations/models/recommendation.model';
import { RecommendationCardComponent } from './components/recommendation-card/recommendation-card';
import { ProgressPanelComponent } from './components/progress-panel/progress-panel';
import { ImpactProjectionPanelComponent } from './components/impact-projection-panel/impact-projection-panel';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    RecommendationCardComponent,
    ProgressPanelComponent,
    ImpactProjectionPanelComponent,
  ],
  templateUrl: './recommendations.html',
})
export class Recommendations implements OnInit {
  private recommendationService = inject(RecommendationService);

  recommendations = signal<Recommendation[]>([]);
  score = signal<Score>({ scoreActual: 0, scorePotencial: 0, accionesCompletadas: 0, accionesTotales: 0 });

  ngOnInit(): void {
    this.recommendationService.getMockRecommendations().subscribe({
      next: (data) => this.recommendations.set(data),
    });
    this.recommendationService.getMockScore().subscribe({
      next: (data) => this.score.set(data),
    });
  }
}
