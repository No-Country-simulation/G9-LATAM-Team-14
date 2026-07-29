import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-summary.html',
})
export class ModalSummaryComponent {
  monthlyQuota = input<number>(0);
  endDate = input<string>('');
  incomePercentage = input<number>(0);
}
