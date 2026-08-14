import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Movement } from '@core/movements/models/movement.model';
import { MovementService } from '@core/movements/services/movement.service';
import { IconFinCoachComponent } from '@shared/icons/iconsFinCoach';

@Component({
  selector: 'app-movement-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconFinCoachComponent],
  templateUrl: './movement-detail-modal.html',
})
export class MovementDetailModalComponent implements OnChanges {
  private movementService = inject(MovementService);

  @Input() movement: Movement | null = null;
  @Input() isOpen = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() movementUpdated = new EventEmitter<void>();
  @Output() movementDeleted = new EventEmitter<void>();

  editDescription = '';
  editNote = '';
  isSaving = false;
  isDeleting = false;

  ngOnChanges(): void {
    if (this.movement) {
      this.editDescription = this.movement.description || '';
      this.editNote = this.movement.note || '';
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSave(): void {
    if (!this.movement || !this.movement.id) return;
    this.isSaving = true;

    this.movementService.updateMovement(this.movement.id, this.editDescription, this.editNote).subscribe({
      next: () => {
        this.isSaving = false;
        this.movementUpdated.emit();
        this.onClose();
      },
      error: (err) => {
        console.error('Error al actualizar movimiento:', err);
        this.isSaving = false;
      }
    });
  }

  onDelete(): void {
    if (!this.movement || !this.movement.id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este movimiento?')) return;

    this.isDeleting = true;
    this.movementService.deleteMovement(this.movement.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.movementDeleted.emit();
        this.onClose();
      },
      error: (err) => {
        console.error('Error al eliminar movimiento:', err);
        this.isDeleting = false;
      }
    });
  }

  get formattedDate(): string {
    if (!this.movement || !this.movement.date) return '';
    const dateStr = this.movement.date;
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return dateStr;
  }
}
