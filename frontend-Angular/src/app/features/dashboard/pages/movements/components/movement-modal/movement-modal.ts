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
  isLoadingAi = false;
  isSubmitting = false;
  submissionError = '';
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

  private getFullDateTime(): string {
    const d = this.date || new Date().toISOString().split('T')[0];
    const t = this.time || new Date().toTimeString().slice(0, 5);
    return `${d}T${t}:00`;
  }

  registerMovement(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.submissionError = '';

    const userId = this.authService.currentUser()?.id || 1;
    const finalDescription = this.movement.description.trim() || 'Nuevo movimiento';
    const finalNote = this.movement.note.trim();
    const fullDateTime = this.getFullDateTime();

    const payload: CreateMovementRequest = {
      description: finalDescription,
      amount: Number(this.movement.amount || 0),
      type: this.movement.type,
      category: this.movement.category,
      date: fullDateTime,
      note: finalNote,
      userId
    };

    this.pendingCreatePayload = payload;
    this.modelSuggestion = undefined;
    this.isLoadingAi = true;
    this.showAiModal = true;
    this.cdr.detectChanges();

    this.movementService.classifyMovement(payload).subscribe({
      next: (suggestion) => {
        this.isSubmitting = false;
        this.isLoadingAi = false;
        this.modelSuggestion = suggestion as AiSuggestion;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error pidiendo sugerencia al backend:', err);
        this.isSubmitting = false;
        this.isLoadingAi = false;
        this.modelSuggestion = undefined;
        this.cdr.detectChanges();
      }
    });
  }

  confirmAiClassification(aiData: { category: string; regularity: string }): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.showAiModal = false;

    const fullDateTime = this.getFullDateTime();
    const payloadToSave = this.pendingCreatePayload
      ? {
          ...this.pendingCreatePayload,
          category: aiData.category,
          regularity: aiData.regularity as 'fijo' | 'variable',
          date: fullDateTime
        }
      : {
          description: this.movement.description || 'Nuevo movimiento',
          amount: Number(this.movement.amount || 0),
          type: this.movement.type,
          category: aiData.category,
          regularity: aiData.regularity as 'fijo' | 'variable',
          date: fullDateTime,
          note: this.movement.note.trim(),
          userId: this.authService.currentUser()?.id || 1
        };

    this.movementService.createMovement(payloadToSave).subscribe({
      next: () => {
        this.save.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar movimiento tras confirmar clasificación:', err);
        this.isSubmitting = false;
        this.submissionError = err?.error?.message
          || 'No fue posible relacionar el pago con una deuda. Incluye el tipo de crédito en la descripción.';
        this.cdr.detectChanges();
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
    this.submissionError = '';
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
