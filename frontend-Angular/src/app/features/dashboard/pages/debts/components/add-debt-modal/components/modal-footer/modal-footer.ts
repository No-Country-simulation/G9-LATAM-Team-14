import { Component, input, output } from '@angular/core';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-modal-footer',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './modal-footer.html',
})
export class ModalFooterComponent {
  submitText = input<string>('Agregar Deuda');
  closeModal = output<void>();
  submitForm = output<void>();
}
