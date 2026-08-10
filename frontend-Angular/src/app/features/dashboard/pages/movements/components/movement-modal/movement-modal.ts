import { Component, EventEmitter, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent } from '@shared/icons/iconsFinCoach';
import { AiClassificationModalComponent, AiSuggestion } from '@shared/components/ai-classification-modal/ai-classification-modal';
import { MovementService } from '@core/movements/services/movement.service';
import { AuthService } from '@core/auth/services/auth.service';
import { CreateMovementRequest } from '@core/movements/models/movement.model';

@Component({
  selector: 'app-movement-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconFinCoachComponent,
    AiClassificationModalComponent
  ],
  templateUrl: './movement-modal.html'
})
export class MovementModalComponent {
  private movementService = inject(MovementService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  date: string = new Date().toISOString().split('T')[0];
  time: string = new Date().toTimeString().slice(0, 5);

  movement = {
    description: '',
    amount: null as number | null,
    type: 'GASTO' as 'INGRESO' | 'GASTO',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    userId: 1
  };

  showAiModal = false;
  isSubmitting = false;
  createdMovementId: number | null = null;
  modelSuggestion?: AiSuggestion;
  private pendingCreatePayload: CreateMovementRequest | null = null;

  expenseCategories = [
    'ALIMENTOS',
    'TRANSPORTE',
    'SALUD',
    'HOGAR',
    'SERVICIOS',
    'ENTRETENIMIENTO',
    'EDUCACION',
    'COMPRAS'
  ];

  incomeCategories = [
    'SALARIO',
    'FREELANCE',
    'BONO',
    'VENTA',
    'INVERSION',
    'INTERESES',
    'REGALO',
    'OTRO'
  ];

  categories = this.expenseCategories;

  selectType(type: 'INGRESO' | 'GASTO'): void {
    this.movement.type = type;
    this.categories = type === 'INGRESO' ? this.incomeCategories : this.expenseCategories;
  }

  selectCategory(category: string): void {
    this.movement.category = category;
  }

  registerMovement(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const userId = this.authService.currentUser()?.id || 1;
    const finalDescription = this.movement.description.trim() || this.movement.note.trim() || 'Nuevo movimiento';

    const payload: CreateMovementRequest = {
      description: finalDescription,
      amount: Number(this.movement.amount || 0),
      type: this.movement.type,
      category: this.movement.category,
      date: this.date || new Date().toISOString().split('T')[0],
      userId
    };

    // First request a classification suggestion without persisting
    this.pendingCreatePayload = payload;
    this.movementService.classifyMovement(payload).subscribe({
      next: (suggestion) => {
        this.isSubmitting = false;
        this.modelSuggestion = suggestion as AiSuggestion;
        this.showAiModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error pidiendo sugerencia al backend:', err);
        this.isSubmitting = false;
        this.modelSuggestion = undefined;
        this.showAiModal = true;
        this.cdr.detectChanges();
      }
    });
  }


  confirmAiClassification(aiData: { category: string; regularity: string }): void {
    this.showAiModal = false;

    const payloadToSave = this.pendingCreatePayload
      ? { ...this.pendingCreatePayload, category: aiData.category }
      : {
          description: this.movement.description,
          amount: Number(this.movement.amount || 0),
          type: this.movement.type,
          category: aiData.category,
          date: this.date || new Date().toISOString().split('T')[0],
          userId: this.authService.currentUser()?.id || 1
        };

    // Persist movement with the confirmed category
    this.movementService.createMovement(payloadToSave).subscribe({
      next: (created) => {
        this.save.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar movimiento tras confirmar clasificación:', err);
        this.save.emit();
        this.closeModal();
      }
    });
  }

  closeAiModal(): void {
    this.showAiModal = false;
  }

  closeModal(): void {
    this.resetForm();
    this.close.emit();
  }

  private resetForm(): void {
    this.showAiModal = false;
    this.isSubmitting = false;
    this.createdMovementId = null;
    this.modelSuggestion = undefined;
    this.date = new Date().toISOString().split('T')[0];
    this.time = new Date().toTimeString().slice(0, 5);
    this.movement = {
      description: '',
      amount: null as number | null,
      type: 'GASTO' as 'INGRESO' | 'GASTO',
      category: '',
      date: this.date,
      note: '',
      userId: 1
    };
    this.categories = this.expenseCategories;
  }
}
