import { Component, inject } from '@angular/core';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';
import { UiService } from '@core/services/ui.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './header.html',
})
export class Header {
  uiService = inject(UiService);
}