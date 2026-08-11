import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SavingsFrequency = 'baja' | 'media' | 'alta';

@Component({
  selector: 'app-savings-frequency-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './savings-frequency-card.html',
})
export class SavingsFrequencyCardComponent {
  frequency = input<SavingsFrequency>('media');
}
