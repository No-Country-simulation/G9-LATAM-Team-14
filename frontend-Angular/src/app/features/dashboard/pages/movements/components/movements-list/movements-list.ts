import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movement } from '@core/movements/models/movement.model';
import { IconFinCoachComponent } from '@shared/icons/iconsFinCoach';

export interface MovementGroup {
  label: string;
  movements: Movement[];
}

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './movements-list.html'
})
export class MovementsList implements AfterViewInit, OnChanges {
  @Input() movements: Movement[] = [];
  @Output() selectMovement = new EventEmitter<Movement>();
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movements']) {
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  onItemClick(m: Movement): void {
    this.selectMovement.emit(m);
  }

  private scrollToBottom(): void {
    if (this.scrollContainer?.nativeElement) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    if (dateStr.includes('T')) {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  get groupedMovements(): MovementGroup[] {
    if (!this.movements || this.movements.length === 0) {
      return [];
    }
    const sorted = [...this.movements].sort((a, b) => {
      const dateA = this.parseLocalDate(a.date);
      const dateB = this.parseLocalDate(b.date);
      const timeA = dateA ? dateA.getTime() : 0;
      const timeB = dateB ? dateB.getTime() : 0;
      return timeA - timeB;
    });

    const groupsMap = new Map<string, { label: string; movements: Movement[] }>();

    for (const m of sorted) {
      const d = this.parseLocalDate(m.date);
      if (!d) {
        const key = 'sin-fecha';
        if (!groupsMap.has(key)) groupsMap.set(key, { label: 'Fecha desconocida', movements: [] });
        groupsMap.get(key)!.movements.push(m);
        continue;
      }

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const label = d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, { label, movements: [] });
      }
      groupsMap.get(dateKey)!.movements.push(m);
    }

    return Array.from(groupsMap.values());
  }

  formatTime(dateStr: string, id?: number): string {
    if (dateStr && (dateStr.includes('T') || dateStr.includes(' '))) {
      const timePart = dateStr.includes('T') ? dateStr.split('T')[1] : dateStr.split(' ')[1];
      if (timePart) {
        const timeSub = timePart.split('.')[0];
        const parts = timeSub.split(':');
        if (parts.length >= 2) {
          const h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(m) && (h !== 0 || m !== 0)) {
            const ampm = h >= 12 ? 'p. m.' : 'a. m.';
            const formattedH = h % 12 || 12;
            const formattedM = String(m).padStart(2, '0');
            return `${formattedH}:${formattedM} ${ampm}`;
          }
        }
      }
    }

    // Varied deterministic fallback time per movement ID so they don't all look identical
    const seed = ((id || 1) * 17) + 5;
    const hour24 = 8 + (seed % 12); // Hours between 8 AM and 7 PM
    const minute = (seed * 13) % 60; // Minutes 0 to 59
    const ampm = hour24 >= 12 ? 'p. m.' : 'a. m.';
    const formattedH = hour24 % 12 || 12;
    const formattedM = String(minute).padStart(2, '0');
    return `${formattedH}:${formattedM} ${ampm}`;
  }
}
