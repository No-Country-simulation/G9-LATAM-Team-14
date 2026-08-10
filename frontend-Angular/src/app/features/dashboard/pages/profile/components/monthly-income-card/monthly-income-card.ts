import { Component, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-monthly-income-card',
  standalone: true,
  imports: [CommonModule, FormsModule, IconFinCoachComponent],
  templateUrl: './monthly-income-card.html',
})
export class MonthlyIncomeCardComponent {
  income = model<number>(4500);
  isEditing = signal<boolean>(false);
  tempIncome = signal<number>(4500);

  toggleEdit(): void {
    this.tempIncome.set(this.income());
    this.isEditing.set(!this.isEditing());
  }

  save(): void {
    if (this.tempIncome() > 0) {
      this.income.set(this.tempIncome());
    }
    this.isEditing.set(false);
  }
}
