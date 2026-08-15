import { Component, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-month-picker-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './month-picker-input.html',
})
export class MonthPickerInputComponent {
  label = input<string>('');
  id = input<string>('');
  value = model<string>('');
}
