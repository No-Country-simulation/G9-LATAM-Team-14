import { Component, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-input.html',
})
export class FormInputComponent {
  label = input<string>('');
  id = input<string>('');
  type = input<string>('text');
  prefix = input<string>('');
  placeholder = input<string>('');
  helpText = input<string>('');
  min = input<number | string>('');
  value = model<any>();
}
