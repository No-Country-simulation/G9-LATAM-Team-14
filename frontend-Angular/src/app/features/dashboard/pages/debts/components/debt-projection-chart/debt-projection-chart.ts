import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-debt-projection-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './debt-projection-chart.html',
})
export class DebtProjectionChartComponent {
  public lineChartType: ChartType = 'line';

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [21, 21, 17, 17, 0, 0],
        label: 'Endeudamiento (%)',
        stepped: 'before',
        borderColor: '#5A7259',
        borderWidth: 3,
        backgroundColor: 'rgba(90, 114, 89, 0.12)',
        fill: true,
        pointBackgroundColor: '#2F4836',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ],
    labels: ['Ene 2026', 'Jul 2026', 'Oct 2027', 'May 2028', 'Jun 2028', 'Dic 2028']
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
          label: (context) => `Endeudamiento: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#526655',
          font: { size: 10 }
        }
      },
      y: {
        min: 0,
        max: 30,
        grid: {
          color: '#E0E8C3'
        },
        ticks: {
          color: '#526655',
          font: { size: 10 },
          callback: (value) => value + '%'
        }
      }
    }
  };
}
