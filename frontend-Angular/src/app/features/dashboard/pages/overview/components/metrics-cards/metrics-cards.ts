import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFinCoachComponent, IconName } from '@app/shared/icons/iconsFinCoach';

export interface OverviewMetric {
  title: string;
  amount: string;
  detail: string;
  icon: IconName;
  badgeBg: string;
  badgeColor: string;
}

@Component({
  selector: 'app-metrics-cards',
  standalone: true,
  imports: [CommonModule, IconFinCoachComponent],
  templateUrl: './metrics-cards.html',
})
export class MetricsCards {
  metrics: OverviewMetric[] = [
    {
      title: 'Ingreso total',
      amount: '$ 1.200',
      detail: 'Entradas confirmadas del mes',
      icon: 'arrow-up',
      badgeBg: 'bg-[#D7E3A9]',
      badgeColor: 'text-[#214523]'
    },
    {
      title: 'Gastos fijos',
      amount: '$ 0',
      detail: 'Egresos clasificados como fijos',
      icon: 'home',
      badgeBg: 'bg-[#FCE6D4]',
      badgeColor: 'text-[#D96B27]'
    },
    {
      title: 'Gastos variables',
      amount: '$ 8',
      detail: 'Egresos variables del mes',
      icon: 'arrow-down',
      badgeBg: 'bg-[#FADCD9]',
      badgeColor: 'text-[#D9534F]'
    },
    {
      title: 'Disponible',
      amount: '$ 1.192',
      detail: 'Ingresos menos gastos del mes',
      icon: 'check-circle',
      badgeBg: 'bg-[#D7E3A9]',
      badgeColor: 'text-[#214523]'
    }
  ];
}
