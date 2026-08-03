import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recommendations-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendations-section.html',
})
export class RecommendationsSection {

  recommendations = [
    {
      icon: 'directions_car',
      iconColor: 'text-[#C62828]',
      iconBackground: 'bg-[#FDF2E6]',
      impact: 'IMPACTO ALTO',
      tagStyle: 'bg-[#FCE7E4] text-[#C62828]',
      title: 'Reduce gastos en Transporte',
      description: 'Usa rutas compartidas para ahorrar hasta S/120 al mes.',
      button: 'Implementar',
      buttonStyle: 'bg-[#556F53] text-white hover:bg-[#4A614A]'
    },
    {
      icon: 'auto_awesome',
      iconColor: 'text-[#556F53]',
      iconBackground: 'bg-[#EEF4E3]',
      impact: 'IMPACTO MEDIO',
      tagStyle: 'bg-[#E9F0DD] text-[#556F53]',
      title: 'Aumenta frecuencia de ahorro',
      description: 'Incrementa tu ahorro automático de S/5 a S/8 diarios.',
      button: 'Configurar',
      buttonStyle: 'border border-[#556F53] bg-white text-[#556F53] hover:bg-[#F6F8F2]'
    },
    {
      icon: 'inventory_2',
      iconColor: 'text-[#8A5A3C]',
      iconBackground: 'bg-[#FDF2E6]',
      impact: 'IMPACTO BAJO',
      tagStyle: 'bg-[#F8EEDB] text-[#8A5A3C]',
      title: 'Revisa suscripciones',
      description: 'Detectamos 2 servicios sin uso en los últimos 30 días.',
      button: 'Verificar',
      buttonStyle: 'border border-[#556F53] bg-white text-[#556F53] hover:bg-[#F6F8F2]'
    }
  ];
}
