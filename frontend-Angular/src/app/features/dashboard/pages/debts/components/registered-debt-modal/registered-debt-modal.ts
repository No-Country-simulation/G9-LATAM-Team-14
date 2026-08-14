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
  confirmAndSave = output<void>();

  title = computed(() => {
    return this.debtData()?.category || 'Deuda sin categoría';
  });

  initialAmountText = computed(() => {
    const total = this.debtData()?.totalAmount;
    if (total !== undefined && total !== null) {
      return `$ ${total.toLocaleString()}`;
    }
    return '$ 0';
  });

  monthlyQuotaText = computed(() => {
    const monthly = this.debtData()?.monthlyAmount;
    if (monthly !== undefined && monthly !== null) {
      return `$ ${monthly.toLocaleString()}`;
    }
    return '$ 0';
  });

  effectiveRateText = computed(() => {
    const total = this.debtData()?.totalAmount || 0;
    const monthly = this.debtData()?.monthlyAmount || 0;
    const months = this.debtData()?.monthsTerm || 12;
    const totalPaid = monthly * months;
    if (total > 0 && totalPaid > total) {
      const annualRate = (((totalPaid - total) / total) / (months / 12)) * 100;
      return `${Math.round(annualRate)}%`;
    }
    return '0%';
  });

  estimatedEndDateText = computed(() => {
    const endDate = this.debtData()?.endDate;
    if (endDate && endDate !== 'N/A') {
      return endDate;
    }
    return 'Por definir';
  });

  estimatedTotalInterestText = computed(() => {
    const total = this.debtData()?.totalAmount || 0;
    const monthly = this.debtData()?.monthlyAmount || 0;
    const months = this.debtData()?.monthsTerm || 12;
    const totalPaid = monthly * months;
    const interest = Math.max(0, totalPaid - total);
    return `$ ${interest.toLocaleString()}`;
  });

  onConfirm(): void {
    this.confirmAndSave.emit();
  }
}
