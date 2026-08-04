import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debt-ratio-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debt-ratio-card.html',
})
export class DebtRatioCardComponent {
  monthlyPayment = input<number>(0);
  incomePercentage = input<number>(0);

  gaugeMarkerPercentage = computed(() => {
    const pct = this.incomePercentage() || 0;
    return Math.min(Math.max(pct, 0), 100);
  });

  debtStatusBadge = computed(() => {
    const pct = this.incomePercentage() || 0;
    if (pct <= 20) {
      return { label: 'SALUDABLE', class: 'bg-[#D6E4B4] text-[#214523]' };
    } else if (pct <= 35) {
      return { label: 'MANEJABLE', class: 'bg-[#FCE6D4] text-[#D96B27]' };
    } else if (pct <= 50) {
      return { label: 'RIESGOSO', class: 'bg-[#FEF3C7] text-[#D97706]' };
    } else {
      return { label: 'CRÍTICO', class: 'bg-[#FEE2E2] text-[#DC2626]' };
    }
  });
}
