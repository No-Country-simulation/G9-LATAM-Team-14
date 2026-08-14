import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financial-recommendation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-recommendation-card.html'
})
export class FinancialRecommendationCard {
  @Input() nextGoal = '';
  @Input() appliedSafeguards: string[] = [];
}
