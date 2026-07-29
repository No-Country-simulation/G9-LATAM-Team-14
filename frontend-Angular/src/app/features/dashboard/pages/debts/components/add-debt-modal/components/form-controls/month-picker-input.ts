import { Component, ElementRef, ViewChild, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-month-picker-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './month-picker-input.html',
})
export class MonthPickerInputComponent {
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  label = input<string>('');
  id = input<string>('monthInput');
  value = model<string>('');

  openPicker(): void {
    if (this.inputRef?.nativeElement && typeof this.inputRef.nativeElement.showPicker === 'function') {
      try {
        this.inputRef.nativeElement.showPicker();
      } catch (e) {
        // Fallback si el navegador restringe showPicker
      }
    }
  }
}
