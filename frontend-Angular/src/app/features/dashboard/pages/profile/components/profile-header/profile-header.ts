import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './profile-header.html',
})
export class ProfileHeaderComponent {
  isEditing = input<boolean>(false);
  editToggle = output<void>();
  saveClick = output<void>();
  cancelClick = output<void>();
}
