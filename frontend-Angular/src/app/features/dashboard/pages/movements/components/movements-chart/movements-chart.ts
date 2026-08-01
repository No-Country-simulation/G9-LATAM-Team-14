import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  registerables
} from 'chart.js';

import {
  ChartConfiguration,
  ChartOptions
} from 'chart.js';

import {
  BaseChartDirective
} from 'ng2-charts';

Chart.register(...registerables);

@Component({
  selector: 'app-movements-chart',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective
  ],
  templateUrl: './movements-chart.html'
})
export class MovementsChart {

  public lineChartData: ChartConfiguration<'line'>['data'] = {

    labels: [
      '1',
      '5',
      '10',
      '15',
      '20',
      '25',
      '31'
    ],

    datasets: [

      {
        label: 'Ingresos',
        data: [0, 800, 1200, 1800, 2200, 2500, 2500],
        tension: 0.4,
        fill: false
      },

      {
        label: 'Gastos',
        data: [0, 200, 500, 1200, 2000, 3000, 3838],
        tension: 0.4,
        fill: false
      }

    ]

  };

  public lineChartOptions: ChartOptions<'line'> = {

    responsive: true,

    plugins: {

      legend: {

        display: true

      }

    }

  };

}
