import { Component, output } from '@angular/core';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-debts-header',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './debts-header.html',
})
export class DebtsHeaderComponent {
  addDebt = output<void>();
}
