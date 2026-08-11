import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movement } from '@core/movements/models/movement.model';
import { IconFinCoachComponent, IconName } from '@shared/icons/iconsFinCoach';

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
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movements']) {
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  private scrollToBottom(): void {
    if (this.scrollContainer?.nativeElement) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }


  get groupedMovements(): MovementGroup[] {
    if (!this.movements || this.movements.length === 0) {
      return [];
    }
    const sorted = [...this.movements].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (isNaN(timeA)) return -1;
      if (isNaN(timeB)) return 1;
      return timeA - timeB;
    });

    const groupsMap = new Map<string, { label: string; movements: Movement[] }>();

    for (const m of sorted) {
      const d = new Date(m.date);
      const isInvalid = isNaN(d.getTime());
      const dateKey = isInvalid ? (m.date || 'sin-fecha') : d.toISOString().split('T')[0];
      const label = isInvalid
        ? m.date || 'Fecha desconocida'
        : d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });

      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, { label, movements: [] });
      }
      groupsMap.get(dateKey)!.movements.push(m);
    }

    return Array.from(groupsMap.values());
  }

  getIconName(category: string): IconName {
    if (!category) return 'tag';

    switch (category.toUpperCase()) {
      // Gastos
      case 'ALIMENTOS': return 'utensils';
      case 'TRANSPORTE': return 'car';
      case 'SALUD': return 'shield-heart';
      case 'ENTRETENIMIENTO': return 'gamepad';
      case 'EDUCACION': return 'graduation';
      case 'HOGAR': return 'home';
      case 'SERVICIOS': return 'zap';
      case 'COMPRAS': return 'shopping-bag';

      // Ingresos
      case 'SALARIO': return 'briefcase';
      case 'FREELANCE': return 'laptop';
      case 'BONO': return 'gift';
      case 'VENTA': return 'shopping-cart';
      case 'INVERSION': return 'evolution';
      case 'INTERESES': return 'landmark';
      case 'REGALO': return 'gift';

      default: return 'tag';
    }
  }

  formatTime(date: string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}

