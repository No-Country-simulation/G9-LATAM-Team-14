import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movement-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './movement-modal.html'
})
export class MovementModalComponent {

  @Output() close = new EventEmitter<void>();

  @Output() save = new EventEmitter<any>();

  movement = {
   description: '',
   amount: 0,
   type: 'GASTO' as 'INGRESO' | 'GASTO',
   category: '',
   date: new Date().toISOString().split('T')[0],
   userId: 1
 };
  categories = [
    'ALIMENTOS',
    'TRABAJO',
    'TRANSPORTE',
    'SALUD',
    'ENTRETENIMIENTO',
    'EDUCACION',
    'HOGAR',
    'SERVICIOS'
  ];

  selectType(type: 'INGRESO' | 'GASTO'): void {
    this.movement.type = type;
  }

  selectCategory(category: string): void {
    this.movement.category = category;
  }

  registerMovement(): void {

    alert("Se hizo clic en Registrar");

      console.log(this.movement);

        this.save.emit(this.movement);
  }

  closeModal(): void {

    this.close.emit();

  }

}
