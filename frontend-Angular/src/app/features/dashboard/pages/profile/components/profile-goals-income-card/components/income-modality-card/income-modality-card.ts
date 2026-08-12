import { Component, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';
import { SecondaryIncome } from '@core/onboarding/services/onboarding.service';

@Component({
  selector: 'app-income-modality-card',
  standalone: true,
  imports: [CommonModule, FormsModule, IconFinCoachComponent],
  templateUrl: './income-modality-card.html',
})
export class IncomeModalityCardComponent {
  isEditing = input<boolean>(false);
  primaryActivity = input<string>('');
  primaryModality = input<string>('');
  secondaryIncomes = input<SecondaryIncome[]>([]);

  tempPrimaryActivity = model<string>('');
  tempPrimaryModality = model<string>('');
  tempSecondaryIncomes = model<SecondaryIncome[]>([]);

  modalityOptions = input<string[]>([]);

  addSecondaryIncome(): void {
    this.tempSecondaryIncomes.update(list => [
      ...list,
      { activity: '', modality: 'Variable' }
    ]);
  }

  removeSecondaryIncome(index: number): void {
    this.tempSecondaryIncomes.update(list => list.filter((_, i) => i !== index));
  }
}
