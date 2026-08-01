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
    amount: null as number | null,
    type: 'GASTO' as 'INGRESO' | 'GASTO',
    category: '',
    date: new Date().toISOString().split('T')[0],
    userId: 1
  };

  // Categorías para gastos
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

  // Categorías para ingresos
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

    this.categories =
      type === 'INGRESO'
        ? this.incomeCategories
        : this.expenseCategories;

  }

  selectCategory(category: string): void {
    this.movement.category = category;
  }

  registerMovement(): void {

    console.log("Enviando movimiento...");
    console.log(this.movement);

    this.save.emit(this.movement);

  }

  closeModal(): void {
    this.close.emit();
  }

}
