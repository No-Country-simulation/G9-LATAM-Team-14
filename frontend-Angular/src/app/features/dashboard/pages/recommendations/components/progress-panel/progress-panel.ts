import { Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, Plugin, registerables } from 'chart.js';
import { Recommendation } from '@core/recommendations/models/recommendation.model';

Chart.register(...registerables);

const centerTextPlugin: Plugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const completed = chart.data.datasets[0].data[0] as number;
    const pending = chart.data.datasets[0].data[1] as number;
    const total = completed + pending;
    if (total === 0) return;

    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#214523';
    ctx.fillText(`${completed}/${total}`, centerX, centerY - 6);

    ctx.font = "500 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#526655';
    ctx.fillText('completadas', centerX, centerY + 14);

    ctx.restore();
  }
};

Chart.register(centerTextPlugin);

@Component({
  selector: 'app-progress-panel',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './progress-panel.html',
})
export class ProgressPanelComponent {
  score = input({ accionesCompletadas: 0, accionesTotales: 0 });
  recommendations = input<Recommendation[]>([]);

  completedCount = computed(() => this.score().accionesCompletadas);
  totalCount = computed(() => this.score().accionesTotales);

  chartData = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: ['Completadas', 'Pendientes'],
    datasets: [{
      data: [this.completedCount(), this.totalCount() - this.completedCount()],
      backgroundColor: ['#425942', '#E7EBC7'],
      borderWidth: 0,
      cutout: '72%'
    }]
  }));

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };
}
