import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyProfile, PuntuacionDiaria } from '@core/evolution/models/evolution.model';

@Component({
  selector: 'app-score-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-line-chart.html'
})
export class ScoreLineChartComponent {
  perfilMensual = input<MonthlyProfile[]>([]);
  selectedMonth = input<string | null>(null);
  ultimoScore = input<number>(0);

  hoveredPoint = signal<PuntuacionDiaria | null>(null);

  currentProfile = computed(() => {
    const list = this.perfilMensual();
    const sel = this.selectedMonth();
    if (!list || list.length === 0) return null;
    return list.find(p => p.mes === sel) || list[list.length - 1];
  });

  dailyScores = computed<PuntuacionDiaria[]>(() => {
    const prof = this.currentProfile();
    return prof?.puntuacionesDiarias || [];
  });

  monthLabel = computed(() => {
    const prof = this.currentProfile();
    if (!prof || !prof.mes) return '';
    const parts = prof.mes.split('-');
    if (parts.length < 2) return prof.mes;
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[monthNum - 1] || parts[1]} ${year}`;
  });

  // SVG Chart Dimensions
  width = 800;
  height = 200;
  paddingY = 20;

  chartPoints = computed(() => {
    const data = this.dailyScores();
    if (!data || data.length === 0) return [];
    const count = data.length;
    const stepX = count > 1 ? (this.width - 50) / (count - 1) : 0;

    return data.map((item, idx) => {
      const x = 30 + idx * stepX;
      const scoreClamped = Math.max(0, Math.min(100, item.score));
      const y = this.height - this.paddingY - (scoreClamped / 100) * (this.height - 2 * this.paddingY);
      return { x, y, data: item };
    });
  });

  svgPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} ${pts[0].y}`;
    return pts.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
  });

  svgAreaPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    const line = this.svgPath();
    const lastX = pts[pts.length - 1].x;
    const firstX = pts[0].x;
    const bottomY = this.height - 20;
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  });

  setHover(pt: PuntuacionDiaria | null): void {
    this.hoveredPoint.set(pt);
  }

  parseDayNum(diaStr: string): number {
    return parseInt(diaStr, 10) || 1;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value || 0);
  }
}
