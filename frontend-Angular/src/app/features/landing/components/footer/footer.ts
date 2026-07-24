import { Component } from '@angular/core';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './footer.html',
})
export class Footer {
  currentYear = new Date().getFullYear();
}
