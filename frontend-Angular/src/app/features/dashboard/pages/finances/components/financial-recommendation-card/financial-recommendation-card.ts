import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financial-recommendation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-recommendation-card.html'
})
export class FinancialRecommendationCard {
  @Input() status: string = 'available';
  @Input() priority: string = 'ALTA';
  @Input() message: string = '';
  @Input() nextAction: string = '';
  @Input() confidencePercentage: number = 92;
  @Input() nextGoal = '';
  @Input() appliedSafeguards: string[] = [];
  @Input() reasons: string[] = [];
}
