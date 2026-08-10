import { Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart, ChartConfiguration, ChartOptions, Plugin, ScriptableContext, registerables
} from 'chart.js';
import { MonthlyProfile } from '@core/evolution/models/evolution.model';

Chart.register(...registerables);

const SALUDABLE_FROM = 85;
const OBSERVACION_FROM = 60;

const STATE_BANDS = [
  { from: SALUDABLE_FROM, to: 100, label: 'SALUDABLE', color: '#556F53', fill: 'rgba(90, 114, 89, 0.10)' },
  { from: OBSERVACION_FROM, to: SALUDABLE_FROM, label: 'EN OBSERVACIÓN', color: '#A15B3E', fill: 'rgba(147, 97, 36, 0.06)' },
  { from: 0, to: OBSERVACION_FROM, label: 'EN RIESGO', color: '#C62828', fill: 'rgba(186, 26, 26, 0.06)' }
];

const stateBandsPlugin: Plugin = {
  id: 'stateBands',
  beforeDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const yScale = chart.scales['y'];
    ctx.save();
    for (const band of STATE_BANDS) {
      const top = yScale.getPixelForValue(band.to);
      const bottom = yScale.getPixelForValue(band.from);
      ctx.fillStyle = band.fill;
      ctx.fillRect(chartArea.left, top, chartArea.width, bottom - top);
      ctx.font = "bold 10px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = band.color;
      ctx.textAlign = 'left';
      ctx.fillText(band.label, chartArea.left + 10, top + 14);
    }
    ctx.restore();
  }
};

Chart.register(stateBandsPlugin);

@Component({
  selector: 'app-score-line-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './score-line-chart.html',
})
export class ScoreLineChartComponent {
  perfilMensual = input<MonthlyProfile[]>([]);
  ultimoMes = input('');
  ultimoScore = input(0);

  chartType = 'line' as const;

  labels = computed(() => this.perfilMensual().map(profile => this.shortMonthLabel(profile.mes)));

  ultimoMesLabel = computed(() => this.longMonthLabel(this.ultimoMes()));

  chartData = computed<ChartConfiguration<'line'>['data']>(() => ({
    labels: this.perfilMensual().map(profile => this.shortMonthLabel(profile.mes)),
    datasets: [
      {
        data: this.perfilMensual().map(profile => profile.score),
        borderColor: '#425942',
        borderWidth: 3,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return 'rgba(90, 114, 89, 0.25)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(90, 114, 89, 0.30)');
          gradient.addColorStop(1, 'rgba(90, 114, 89, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#425942',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7
      }
    ]
  }));

  chartOptions: ChartOptions = {
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
          label: (context) => `Score: ${context.parsed?.['y'] ?? 0}/100`
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
        min: 0,
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      }
    }
  };

  private shortMonthLabel(mes: string): string {
    const [, month] = mes.split('-').map(Number);
    return new Date(2000, month - 1, 1).toLocaleDateString('es-PE', { month: 'short' });
  }

  private longMonthLabel(mes: string): string {
    if (!mes) return '';
    const [year, month] = mes.split('-').map(Number);
    const label = new Date(year, month - 1, 1).toLocaleDateString('es-PE', { month: 'long' });
    return `${label.toUpperCase()} ${year}`;
  }
}
