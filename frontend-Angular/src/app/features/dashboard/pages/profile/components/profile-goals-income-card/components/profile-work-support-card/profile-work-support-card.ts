import { Component, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-profile-work-support-card',
  standalone: true,
  imports: [CommonModule, FormsModule, IconFinCoachComponent],
  templateUrl: './profile-work-support-card.html',
})
export class ProfileWorkSupportCardComponent {
  isEditing = input<boolean>(false);
  workSupportList = input<string[]>([]);
  tempWorkSupportList = model<string[]>([]);

  newWorkSupportText = signal<string>('');

  addWorkSupport(): void {
    const text = this.newWorkSupportText().trim();
    if (text) {
      this.tempWorkSupportList.update(list => [...list, text]);
      this.newWorkSupportText.set('');
    }
  }

  removeWorkSupport(index: number): void {
    this.tempWorkSupportList.update(list => list.filter((_, i) => i !== index));
  }
}
