import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-finances-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finances-header.html'
})
export class FinancesHeader {
  @Input() selectedPeriod: 30 | 60 | 90 = 60;
  @Output() periodChange = new EventEmitter<30 | 60 | 90>();

  onSelectPeriod(period: 30 | 60 | 90): void {
    this.periodChange.emit(period);
  }
}
