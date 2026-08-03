import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alerts-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts-section.html',
})
export class AlertsSection {

  alerts = [
    {
      title: 'Alerta Transporte',
      description: 'Excediste el presupuesto sugerido en S/45.',
      icon: 'warning',
      background: 'bg-[#F7EDD3]',
      border: 'border-[#B74A45]',
      iconColor: 'text-[#B74A45]'
    },
    {
      title: 'Reto de Ahorro',
      description: 'Ahorraste S/120 extras esta semana. ¡Sigue así!',
      icon: 'savings',
      background: 'bg-[#E3E9C6]',
      border: 'border-[#556F53]',
      iconColor: 'text-[#556F53]'
    }
  ];
}
