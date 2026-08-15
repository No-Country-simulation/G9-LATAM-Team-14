import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-debt-ratio-card',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './debt-ratio-card.html',
})
export class DebtRatioCardComponent {
  monthlyPayment = input<number>(0);
  incomePercentage = input<number>(0);
  readonly circumference = 226.19;

  strokeDashOffset = computed(() => {
    const pct = Math.min(Math.max(this.incomePercentage() || 0, 0), 100);
    return this.circumference - (this.circumference * pct) / 100;
  });

  strokeColor = computed(() => {
    const pct = this.incomePercentage() || 0;
    if (pct <= 20) return '#22C55E';
    if (pct <= 35) return '#849C65';
    if (pct <= 50) return '#D97706';
    return '#EF4444';
  });

  debtStatusBadge = computed(() => {
    const pct = this.incomePercentage() || 0;
    if (pct <= 20) {
      return { label: 'SALUDABLE', class: 'bg-[#D6E4B4] text-[#214523]' };
    } else if (pct <= 35) {
      return { label: 'MANEJABLE', class: 'bg-[#E5ECBF] text-[#214523]' };
    } else if (pct <= 50) {
      return { label: 'RIESGOSO', class: 'bg-[#FEF3C7] text-[#D97706]' };
    } else {
      return { label: 'CRÍTICO', class: 'bg-[#FEE2E2] text-[#DC2626]' };
    }
  });
}
