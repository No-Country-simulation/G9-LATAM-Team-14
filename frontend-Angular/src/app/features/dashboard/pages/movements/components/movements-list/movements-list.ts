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

      // Gastos
      case 'ALIMENTOS': return '🍴';
      case 'TRANSPORTE': return '🚌';
      case 'SALUD': return '💊';
      case 'ENTRETENIMIENTO': return '🎮';
      case 'EDUCACION': return '📚';
      case 'HOGAR': return '🏠';
      case 'SERVICIOS': return '💡';
      case 'COMPRAS': return '🛍️';

      // Ingresos
      case 'SALARIO': return '💼';
      case 'FREELANCE': return '💻';
      case 'BONO': return '🎁';
      case 'VENTA': return '🛒';
      case 'INVERSION': return '📈';
      case 'INTERESES': return '🏦';
      case 'REGALO': return '🎉';
      case 'OTRO': return '💰';

      default: return '💰';

    }

  }

  formatTime(date: string): string {

    const d = new Date(date);

    return d.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });

  }

}
