import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-movements-header',
  standalone: true,
  imports: [],
  templateUrl: './movements-header.html'
})
export class MovementsHeader {

  @Input() currentDate!: string;

  @Output() openModal = new EventEmitter<void>();

  onOpenModal() {
    this.openModal.emit();
  }

}
