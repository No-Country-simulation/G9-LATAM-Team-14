import { Component, output } from '@angular/core';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-modal-header',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './modal-header.html',
})
export class ModalHeaderComponent {
  closeModal = output<void>();
}
