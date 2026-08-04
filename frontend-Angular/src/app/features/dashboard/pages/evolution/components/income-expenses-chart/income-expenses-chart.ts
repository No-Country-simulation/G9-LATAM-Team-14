import { Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart, ChartConfiguration, ChartOptions, ChartType, registerables
} from 'chart.js';
import { IncomeVsExpensesPoint } from '@core/evolution/models/evolution.model';

Chart.register(...registerables);

@Component({
  selector: 'app-income-expenses-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './income-expenses-chart.html',
})
export class IncomeExpensesChartComponent {
  data = input<IncomeVsExpensesPoint[]>([]);

  chartType: ChartType = 'bar';

  labels = computed(() => this.data().map(point => this.shortMonthLabel(point.mes)));

  chartData = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.labels(),
    datasets: [
      {
        label: 'Ingresos',
        data: this.data().map(point => point.ingresos),
        backgroundColor: '#5A7259',
        borderRadius: 4,
        maxBarThickness: 28
      },
      {
        label: 'Gastos',
        data: this.data().map(point => point.gastos),
        backgroundColor: '#78583E',
        borderRadius: 4,
        maxBarThickness: 28
      },
      {
        label: 'Deudas',
        data: this.data().map(point => point.deudas),
        backgroundColor: '#7895B2',
        borderRadius: 4,
        maxBarThickness: 28
      }
    ]
  }));

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#2F4836',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.dataset.label}: S/ ${context.parsed.y.toLocaleString('es-PE')}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          display: false
        },
        beginAtZero: true
      }
    }
  };

  private shortMonthLabel(mes: string): string {
    const [, month] = mes.split('-').map(Number);
    return new Date(2000, month - 1, 1).toLocaleDateString('es-PE', { month: 'short' });
  }
}
