import { Component, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-profile-hobbies-card',
  standalone: true,
  imports: [CommonModule, FormsModule, IconFinCoachComponent],
  templateUrl: './profile-hobbies-card.html',
})
export class ProfileHobbiesCardComponent {
  isEditing = input<boolean>(false);
  hobbiesList = input<string[]>([]);
  tempHobbiesList = model<string[]>([]);

  newHobbyText = signal<string>('');

  addHobby(): void {
    const text = this.newHobbyText().trim();
    if (text) {
      this.tempHobbiesList.update(list => [...list, text]);
      this.newHobbyText.set('');
    }
  }

  removeHobby(index: number): void {
    this.tempHobbiesList.update(list => list.filter((_, i) => i !== index));
  }
}
