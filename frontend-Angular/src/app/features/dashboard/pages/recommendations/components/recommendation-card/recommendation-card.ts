import { Component, input } from '@angular/core';
import { Recommendation } from '@core/recommendations/models/recommendation.model';

const PRIORITY_STYLES: Record<string, { border: string; badge: string; badgeText: string }> = {
  ALTA: {
    border: 'border-l-[#C62828]',
    badge: 'bg-[#C62828]/10 text-[#C62828]',
    badgeText: 'Alta'
  },
  MEDIA: {
    border: 'border-l-[#A15B3E]',
    badge: 'bg-[#A15B3E]/10 text-[#A15B3E]',
    badgeText: 'Media'
  },
  BAJA: {
    border: 'border-l-[#556F53]',
    badge: 'bg-[#556F53]/10 text-[#556F53]',
    badgeText: 'Baja'
  }
};

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [],
  templateUrl: './recommendation-card.html',
})
export class RecommendationCardComponent {
  recommendation = input.required<Recommendation>();

  get styles() {
    return PRIORITY_STYLES[this.recommendation().prioridad] ?? PRIORITY_STYLES['BAJA'];
  }

  get impactPercent(): number {
    return Math.min(100, (this.recommendation().impacto / 10) * 100);
  }
}
