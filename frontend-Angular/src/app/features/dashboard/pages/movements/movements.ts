import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MovementService } from '../../services/movement.service';
import { Movement } from '../../../../models/movement.model';
import { MovementModalComponent } from './movement-modal/movement-modal';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MovementModalComponent
  ],
  templateUrl: './movements.html',
})
export class Movements implements OnInit {

  movements: Movement[] = [];

  currentDate = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  isModalOpen = false;

  constructor(
    private movementService: MovementService
  ) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {

    this.movementService.getMovements().subscribe({

      next: (data: Movement[]) => {

        console.log("=== DATA ===");
        console.log(data);
        console.log("Cantidad:", data.length);

        this.movements = data;

        console.log("Movements:", this.movements);

      },

      error: (err) => {
        console.error(err);
      }

    });

  }

  openModal(): void {
    console.log('CLICK');
     alert('CLICK');

       this.isModalOpen = true;

       console.log(this.isModalOpen);
  }
  closeModal(): void {
    this.isModalOpen = false;
  }
  saveMovement(movement: any): void {

     console.log("Enviando:", movement);

     this.movementService.createMovement(movement).subscribe({

       next: (response) => {

         console.log("Movimiento guardado", response);

         this.closeModal();

         this.loadMovements();

       },

       error: (err) => {

         console.error("Error al guardar", err);

         this.closeModal();

    }

  });

}
  getTotalIngresos(): number {
    return this.movements
      .filter(m => m.type === 'INGRESO')
      .reduce((total, m) => total + m.amount, 0);
  }

  getTotalGastos(): number {
    return this.movements
      .filter(m => m.type === 'GASTO')
      .reduce((total, m) => total + m.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIngresos() - this.getTotalGastos();
  }

  getIcon(category: string): string {

    switch (category.toUpperCase()) {

      case 'ALIMENTOS':
        return '🛒';

      case 'TRABAJO':
        return '💼';

      case 'TRANSPORTE':
        return '🚌';

      case 'SALUD':
        return '💊';

      case 'ENTRETENIMIENTO':
        return '🎮';

      case 'EDUCACION':
        return '📚';

      case 'HOGAR':
        return '🏠';

      case 'SERVICIOS':
        return '💡';

      default:
        return '💰';
    }

  }

}
