import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-financial-status-card',
  standalone: true,
  imports: [CommonModule, RouterLink, IconFinCoachComponent],
  templateUrl: './financial-status-card.html',
})
export class FinancialStatusCard {
  status = 'EN OBSERVACIÓN';
  title = 'Tu perfil financiero este mes';
  subtitle = 'Hola mensaje';
  confidence = '95.06%';

  // Círculo SVG Donut: radio r=36, perímetro 226.19
  readonly circumference = 226.19;
  strokeDashOffset = 226.19 - (226.19 * 0.9506);
}
