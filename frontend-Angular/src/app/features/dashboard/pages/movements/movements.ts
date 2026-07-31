import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MovementService } from '../../services/movement.service';
import { Movement } from '../../../../models/movement.model';

import { MovementModalComponent } from './components/movement-modal/movement-modal';
import { MovementsHeader } from './components/movements-header/movements-header';
import { MovementsList } from './components/movements-list/movements-list';
import { MovementsSummaryCards } from './components/movements-summary-cards/movements-summary-cards';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MovementsHeader,
    MovementsList,
    MovementsSummaryCards,

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

  ngOnInit() {
      setTimeout(() => {
          this.loadMovements();
      }, 0);
  }

  loadMovements(): void {

    console.log("Entró a loadMovements");

    this.movementService.getMovements().subscribe({

      next: (data) => {

        console.log("Datos recibidos:", data);

        this.movements = data;

      },

      error: (err) => {

        console.error("ERROR:", err);

      }

    });

  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveMovement(movement: any): void {

    this.movementService.createMovement(movement).subscribe({

      next: () => {

        this.closeModal();
        this.loadMovements();

      },

      error: (err) => {

        console.error('Error al guardar movimiento', err);

      }

    });

  }

}
