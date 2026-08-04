import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SavingsFrequency = 'baja' | 'media' | 'alta';

@Component({
  selector: 'app-savings-frequency-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './savings-frequency-card.html',
})
export class SavingsFrequencyCardComponent {
  frequency = model<SavingsFrequency>('media');

  selectFrequency(freq: SavingsFrequency): void {
    this.frequency.set(freq);
  }
}
