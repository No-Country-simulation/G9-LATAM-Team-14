import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconFinCoachComponent } from '@shared/icons/iconsFinCoach';

@Component({
  selector: 'app-movements-header',
  standalone: true,
  imports: [IconFinCoachComponent],
  templateUrl: './movements-header.html'
})
export class MovementsHeader {
  @Input() currentDate!: string;
  @Input() isSummaryActive: boolean = false;
  @Output() openModal = new EventEmitter<void>();
  @Output() toggleSummary = new EventEmitter<void>();

  onOpenModal() {
    this.openModal.emit();
  }

  onToggleSummary() {
    this.toggleSummary.emit();
  }
}



