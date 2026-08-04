import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeRange } from '@core/evolution/models/evolution.model';

@Component({
  selector: 'app-evolution-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evolution-header.html',
})
export class EvolutionHeaderComponent {
  range = input<TimeRange>('6M');
  rangeChange = output<TimeRange>();

  ranges: TimeRange[] = ['3M', '6M', '1A'];

  selectRange(range: TimeRange): void {
    this.rangeChange.emit(range);
  }
}
