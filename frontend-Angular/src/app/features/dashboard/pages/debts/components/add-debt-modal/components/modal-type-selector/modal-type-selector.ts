import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RegistrationType = 'installment' | 'fixed';

@Component({
  selector: 'app-modal-type-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-type-selector.html',
})
export class ModalTypeSelectorComponent {
  selectedType = model<RegistrationType>('installment');
}
