import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
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
    private movementService: MovementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {

    console.log("Entró a loadMovements");

    this.movementService.getMovements().subscribe({

      next: (data) => {

        console.log("Datos recibidos:", data);

        this.movements = data;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error("ERROR:", err);

      }

    });

  }

  openModal(): void {

    console.trace("ABRIENDO MODAL");

    this.isModalOpen = true;

  }

  closeModal(): void {

    console.log("CERRANDO MODAL");

    this.isModalOpen = false;

    this.cdr.detectChanges();

  }

 saveMovement(movement: any): void {

   console.log("Antes del POST");

   this.movementService.createMovement(movement).subscribe({

     next: (data) => {

       console.log("NEXT", data);

       this.closeModal();
       this.loadMovements();
       this.cdr.detectChanges();

     },

     error: (err) => {

       console.error("ERROR", err);

     }

   });

  }
}

