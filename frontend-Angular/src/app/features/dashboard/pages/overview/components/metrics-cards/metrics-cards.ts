import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metrics-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-cards.html',
})
export class MetricsCards {

  metrics = [

    {
      title: 'INGRESO TOTAL',
      amount: 'S/ 5,300',
      amountColor: 'text-[#49664B]',
      detail: 'Incluye S/ 800 extra',
      detailColor: 'text-[#49664B]',
      icon: 'trending_up'
    },

    {
      title: 'GASTOS FIJOS',
      amount: 'S/ 1,125',
      amountColor: 'text-[#8B5A2B]',
      detail: '21% de tu ingreso',
      detailColor: 'text-[#49504A]',
      icon: 'pie_chart'
    },

    {
      title: 'GASTOS VARIABLES',
      amount: 'S/ 760',
      amountColor: 'text-[#8B5A00]',
      detail: '+10% vs mes anterior',
      detailColor: 'text-[#D53A33]',
      icon: 'warning'
    },

    {
      title: 'DISPONIBLE',
      amount: 'S/ 3,415',
      amountColor: 'text-[#5B6F5C]',
      detail: '64% de tu ingreso',
      detailColor: 'text-[#49664B]',
      icon: 'verified'
    }

  ];

}
