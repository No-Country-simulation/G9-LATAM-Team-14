import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';
import { ProfileDebtView } from '../../profile';

@Component({
  selector: 'app-profile-debts-card',
  standalone: true,
  imports: [CommonModule, RouterLink, IconFinCoachComponent],
  templateUrl: './profile-debts-card.html',
})
export class ProfileDebtsCardComponent {
  debts = input<ProfileDebtView[]>([]);
}
