import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovementService } from '@core/movements/services/movement.service';
import { AuthService } from '@core/auth/services/auth.service';
import { Movement, CreateMovementRequest } from '@core/movements/models/movement.model';
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
  private movementService = inject(MovementService);
  private authService = inject(AuthService);

  movements = signal<Movement[]>([]);
  isModalOpen = signal<boolean>(false);

  currentDate = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.movementService.getMovements().subscribe({
      next: (data) => {
        this.movements.set(data || []);
      },
      error: (err) => {
        console.error('Error al cargar movimientos:', err);
        this.movements.set([]);
      }
    });
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveMovement(movementPayload: CreateMovementRequest): void {
    const userId = this.authService.currentUser()?.id || 1;
    const request: CreateMovementRequest = {
      ...movementPayload,
      userId
    };

    this.movementService.createMovement(request).subscribe({
      next: () => {
        this.closeModal();
        this.loadMovements();
      },
      error: (err) => {
        console.error('Error al guardar movimiento:', err);
      }
    });
  }
}
