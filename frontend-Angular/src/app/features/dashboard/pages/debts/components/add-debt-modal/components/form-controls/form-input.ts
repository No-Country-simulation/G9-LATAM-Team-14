import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './form-input.html',
})
export class FormInputComponent {
  label = input<string>('');
  id = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  prefix = input<string>('');
  helpText = input<string>('');
  min = input<string | number>('');
  value = model<any>('');
}
