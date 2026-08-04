import { Component, effect, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, Chart, registerables } from 'chart.js';
import { DebtProjectionPoint } from '@app/core/debts/models/debt.model';

Chart.register(...registerables);

@Component({
  selector: 'app-debt-projection-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './debt-projection-chart.html',
})
export class DebtProjectionChartComponent {
  points = input<DebtProjectionPoint[]>([]);
  public lineChartType: ChartType = 'line';

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Saldo pendiente (S/)',
        borderColor: '#5A7259',
        borderWidth: 3,
        backgroundColor: 'rgba(90, 114, 89, 0.12)',
        fill: true,
        pointBackgroundColor: '#2F4836',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartOptions = {
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
          label: (context) => `Saldo: S/ ${Number(context.parsed.y || 0).toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#526655', font: { size: 10 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#E0E8C3' },
        ticks: {
          color: '#526655',
          font: { size: 10 },
          callback: (value) => 'S/ ' + Number(value).toLocaleString()
        }
      }
    }
  };

  constructor() {
    effect(() => {
      const dataPoints = this.points() || [];
      if (dataPoints.length > 0) {
        const labels = dataPoints.map(p => this.formatMonthLabel(p.month));
        const values = dataPoints.map(p => p.balance);

        this.lineChartData = {
          labels,
          datasets: [
            {
              ...this.lineChartData.datasets[0],
              data: values
            }
          ]
        };
      }
    });
  }

  private formatMonthLabel(monthStr: string): string {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    if (!year || !month) return monthStr;

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
    const idx = parseInt(month, 10) - 1;
    return `${monthNames[idx] || month} ${year.slice(2)}`;
  }
}
