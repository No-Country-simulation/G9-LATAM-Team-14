import { Component, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-income-net-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './income-net-card.html',
})
export class IncomeNetCardComponent {
  isEditing = input<boolean>(false);
  income = input<number>(0);
  tempIncome = model<number>(0);
}
