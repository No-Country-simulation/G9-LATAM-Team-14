import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transactions-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-summary-cards.html',
})
export class TransactionsSummaryCardsComponent {
  @Input() alimentacionTotal = '';
  @Input() transporteTotal = '';
  @Input() serviciosTotal = '';
  @Input() ocioTotal = '';

  @Input() alimentacionProgress = 0;
  @Input() transporteProgress = 0;
  @Input() serviciosProgress = 0;
  @Input() ocioProgress = 0;

  iconPath(name: string): string {
    const paths: Record<string, string> = {
      restaurant: 'M4 3v7a4 4 0 0 0 4 4v7M8 3v11M12 3v11M16 3h1a3 3 0 0 1 3 3v15',
      directions_car: 'M5 11h14l-1.5-4.5A3 3 0 0 0 14.65 4h-5.3a3 3 0 0 0-2.85 2.5L5 11Zm0 0v5h2m12-5v5h-2M7 16a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
      bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
      sports_esports: 'M5 8h14a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-2l-3 3-3-3H5a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3Zm3 4h2m4 0h2',
    };
    return paths[name] ?? '';
  }
}

