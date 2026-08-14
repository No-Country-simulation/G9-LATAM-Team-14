import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';
import { NewDebtPayload } from '../add-debt-modal/add-debt-modal';

@Component({
  selector: 'app-registered-debt-modal',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './registered-debt-modal.html',
})
export class RegisteredDebtModalComponent {
  isOpen = input<boolean>(false);
  debtData = input<NewDebtPayload | null>(null);
  closeModal = output<void>();

  title = computed(() => {
    return this.debtData()?.category || 'Crédito educativo';
  });

  initialAmountText = computed(() => {
    const total = this.debtData()?.totalAmount;
    if (total !== undefined && total !== null && total > 0) {
      return `$ ${total.toLocaleString()}`;
    }
    return '$ 600';
  });

  monthlyQuotaText = computed(() => {
    const monthly = this.debtData()?.monthlyAmount;
    if (monthly !== undefined && monthly !== null && monthly > 0) {
      return `$ ${monthly.toLocaleString()}`;
    }
    return '$ 53';
  });

  effectiveRateText = computed(() => {
    return '12%';
  });

  estimatedEndDateText = computed(() => {
    const endDate = this.debtData()?.endDate;
    if (endDate && endDate !== 'N/A') {
      return endDate;
    }
    return '08 de ago de 2027';
  });

  estimatedTotalInterestText = computed(() => {
    const total = this.debtData()?.totalAmount || 600;
    const monthly = this.debtData()?.monthlyAmount || 53;
    const months = this.debtData()?.monthsTerm || 12;
    const totalPaid = monthly * months;
    const interest = Math.max(0, totalPaid - total);
    if (interest > 0) {
      return `$ ${interest.toLocaleString()}`;
    }
    return '$ 38';
  });
}
