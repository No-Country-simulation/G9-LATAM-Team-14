import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movement } from '../../../../../../models/movement.model';

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movements-list.html'
})
export class MovementsList {

  @Input() movements: Movement[] = [];

  getIcon(category: string): string {

    switch (category.toUpperCase()) {

      case 'ALIMENTOS': return '🛒';
      case 'TRABAJO': return '💼';
      case 'TRANSPORTE': return '🚌';
      case 'SALUD': return '💊';
      case 'ENTRETENIMIENTO': return '🎮';
      case 'EDUCACION': return '📚';
      case 'HOGAR': return '🏠';
      case 'SERVICIOS': return '💡';
      default: return '💰';

    }

  }

}
