import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

interface CategoryPercentage {
  category: string;
  percentage: number;
}

interface DebtOption {
  id: number;
  category: string;
  monthlyAmount: number;
  monthlyAmountLabel?: string;
}

@Component({
  selector: 'app-transaction-classification-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-classification-modal.html',
})
export class TransactionClassificationModalComponent {
  @Input() isOpen = false;
  @Input() canClose = false;
  @Input() modalStep = 'form';
  @Input() modalError = '';
  @Input() classification: any | null = null;
  @Input() confidence: number | null = null;
  @Input() regularityConfidence: number | null = null;
  @Input() requiresReview: boolean | null = null;
  @Input() suggestedCategory = '';
  @Input() suggestedPurpose = '';
  @Input() suggestedRegularity = '';
  @Input() classificationOptions: CategoryPercentage[] = [];
  @Input() selectedCategory = '';
  @Input() selectedPurpose = '';
  @Input() selectedRegularity = '';
  @Input() debts: DebtOption[] = [];
  @Input() amountLabel = '';

  @Output() close = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();
  @Output() selectCategory = new EventEmitter<string>();
  @Output() setPurpose = new EventEmitter<string>();
  @Output() selectDebt = new EventEmitter<string>();
  @Output() selectRegularity = new EventEmitter<string>();
  @Output() confirm = new EventEmitter<void>();

  iconPath(name: string): string {
    const paths: Record<string, string> = {
      warning: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4m0 4h.01',
      close: 'M18 6 6 18M6 6l12 12',
    };
    return paths[name] ?? '';
  }

  readableValue(value: string | null | undefined): string {
    if (!value) return '—';
    const readable = value.split('_').join(' ');
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  }
}
