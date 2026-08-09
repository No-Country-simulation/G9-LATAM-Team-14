import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent } from '../../icons/iconsFinCoach';

export interface CategoryOption {
  name: string;
  confidence: string;
}

@Component({
  selector: 'app-ai-classification-modal',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './ai-classification-modal.html',
})
export class AiClassificationModalComponent {
  @Input() isOpen = false;
  @Input() description = 'comprar helado';
  @Input() amount: number | null = 180;
  @Input() type: 'EGRESO' | 'INGRESO' = 'EGRESO';
  @Input() confidencePercentage = '60.27%';
  @Input() suggestedPurpose = 'Gasto ocasional / ocio';

  @Output() confirm = new EventEmitter<{ category: string; regularity: string }>();
  @Output() close = new EventEmitter<void>();

  selectedCategory = 'Trabajo independiente';
  selectedRegularity = 'Variable';

  categories: CategoryOption[] = [
    { name: 'Trabajo independiente', confidence: '60.27%' },
    { name: 'Ingresos laborales', confidence: '17.68%' },
    { name: 'Otra / ambigua', confidence: '8.11%' },
    { name: 'Vestimenta', confidence: '2.75%' },
  ];

  selectCategory(catName: string): void {
    this.selectedCategory = catName;
  }

  selectRegularity(reg: string): void {
    this.selectedRegularity = reg;
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
