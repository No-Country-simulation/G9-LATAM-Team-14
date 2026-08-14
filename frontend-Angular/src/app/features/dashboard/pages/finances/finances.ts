import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent } from '@shared/icons/iconsFinCoach';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './finances.html'
})
export class Finances {
  currentDate = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
