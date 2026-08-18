import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent } from '../../icons/iconsFinCoach';

export interface CategoryOption {
  name: string;
  confidence: string;
}

export interface AiSuggestion {
  category: string;
  categoryConfidencePercentage: number;
  alternativeCategories: { category: string; percentage: number }[];
  purpose: string;
  regularity: string;
  modelRequiresReview: boolean;
}

@Component({
  selector: 'app-ai-classification-modal',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './ai-classification-modal.html',
})
export class AiClassificationModalComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);

  @Input() isOpen = false;
  @Input() isLoading = false;
  @Input() description = '';
  @Input() amount: number | null = null;
  @Input() type: 'EGRESO' | 'INGRESO' = 'EGRESO';
  @Input() suggestion?: AiSuggestion;

  @Output() confirm = new EventEmitter<{ category: string; regularity: string }>();
  @Output() close = new EventEmitter<void>();

  selectedCategory = '';
  selectedRegularity = 'variable';
  suggestedRegularity = 'variable';
  confidencePercentage = '';
  suggestedPurpose = '';
  categories: CategoryOption[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (this.suggestion) {
      this.buildFromSuggestion(this.suggestion);
      this.cdr.markForCheck();
    }
  }


  private buildFromSuggestion(s: AiSuggestion): void {
    this.selectedCategory = s.category || '';
    const modelRegularity = (s.regularity || '').toLowerCase();
    this.suggestedRegularity = modelRegularity === 'fijo' ? 'fijo' : 'variable';
    this.selectedRegularity = this.suggestedRegularity;

    this.confidencePercentage = s.categoryConfidencePercentage != null
      ? `${s.categoryConfidencePercentage.toFixed(1)}%`
      : '';
    this.suggestedPurpose = s.purpose || '';

    const mainCat = s.category
      ? [{
          name: s.category,
          confidence: s.categoryConfidencePercentage != null ? `${s.categoryConfidencePercentage.toFixed(1)}%` : ''
        }]
      : [];

    const altCats = (s.alternativeCategories || []).map(a => ({
      name: a.category,
      confidence: a.percentage != null ? `${a.percentage.toFixed(1)}%` : ''
    }));

    const seen = new Set<string>();
    const combined: CategoryOption[] = [];
    for (const item of [...mainCat, ...altCats]) {
      if (item.name && !seen.has(item.name)) {
        seen.add(item.name);
        combined.push(item);
      }
    }

    this.categories = combined;
  }

  trackByName(index: number, item: CategoryOption): string | number {
    return item?.name ?? index;
  }

  selectCategory(catName: string): void {
    this.selectedCategory = catName;
  }

  selectRegularity(reg: string): void {
    this.selectedRegularity = reg.toLowerCase();
  }

  onConfirm(): void {
    this.confirm.emit({
      category: this.selectedCategory,
      regularity: this.selectedRegularity
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
