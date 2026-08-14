import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SavingsFrequency = 'baja' | 'media' | 'alta' | string;

@Component({
  selector: 'app-savings-frequency-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './savings-frequency-card.html',
})
export class SavingsFrequencyCardComponent {
  frequency = input<SavingsFrequency>('media');

  normFrequency = computed(() => {
    const val = (this.frequency() || '').toString().toLowerCase().trim();
    if (val.includes('baj') || val.includes('low')) return 'baja';
    if (val.includes('alt') || val.includes('high')) return 'alta';
    return 'media';
  });
}
