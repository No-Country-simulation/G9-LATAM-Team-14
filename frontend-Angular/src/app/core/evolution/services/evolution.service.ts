import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@environments/environment';
import { EvolutionData, EvolutionResponse, TimeRange } from '../models/evolution.model';

@Injectable({
  providedIn: 'root'
})
export class EvolutionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/evolucion`;

  getEvolution(range: TimeRange = '6M'): Observable<EvolutionResponse> {
    return this.http.get<EvolutionResponse>(this.apiUrl, {
      params: { rango: range },
      withCredentials: true
    });
  }

  getMock(range: TimeRange = '6M'): Observable<EvolutionData> {
    return of(this.buildMock(range));
  }

  private buildMock(range: TimeRange): EvolutionData {
    const meses = range === '1A'
      ? ['2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07']
      : range === '3M'
        ? ['2026-05', '2026-06', '2026-07']
        : ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];

    const scores: Record<string, number> = {
      '2025-08': 90, '2025-09': 88, '2025-10': 84, '2025-11': 82,
      '2025-12': 78, '2026-01': 76, '2026-02': 74, '2026-03': 72,
      '2026-04': 68, '2026-05': 64, '2026-06': 61, '2026-07': 58
    };

    const ingresos: Record<string, number> = {
      '2025-08': 5200, '2025-09': 5000, '2025-10': 5100, '2025-11': 4900,
      '2025-12': 5600, '2026-01': 5300, '2026-02': 5000, '2026-03': 4900,
      '2026-04': 4500, '2026-05': 4500, '2026-06': 4800, '2026-07': 5300
    };

    const gastos: Record<string, number> = {
      '2025-08': 1600, '2025-09': 1700, '2025-10': 1800, '2025-11': 1900,
      '2025-12': 2100, '2026-01': 2000, '2026-02': 2100, '2026-03': 2300,
      '2026-04': 2400, '2026-05': 2800, '2026-06': 2900, '2026-07': 2750
    };

    const deudas: Record<string, number> = {
      '2025-08': 900, '2025-09': 900, '2025-10': 900, '2025-11': 900,
      '2025-12': 900, '2026-01': 1300, '2026-02': 1300, '2026-03': 1300,
      '2026-04': 1300, '2026-05': 1300, '2026-06': 1300, '2026-07': 1300
    };

    const perfilMensual = meses.map(mes => ({
      mes,
      score: scores[mes],
      estado: this.estadoDe(scores[mes])
    }));

    const ingresosVsGastos = meses.map(mes => ({
      mes,
      ingresos: ingresos[mes],
      gastos: gastos[mes],
      deudas: deudas[mes]
    }));

    const ultimoMes = meses[meses.length - 1];
    const ultimoScore = scores[ultimoMes];

    return {
      rango: range,
      ultimoMes,
      ultimoScore,
      perfilMensual,
      ingresosVsGastos,
      gastosPorCategoria: [
        { categoria: 'Alimentación', monto: 1200, porcentaje: 65 },
        { categoria: 'Transporte', monto: 450, porcentaje: 35 },
        { categoria: 'Ocio', monto: 800, porcentaje: 45 },
        { categoria: 'Otros', monto: 300, porcentaje: 20 }
      ],
      gastoTotalMes: 2750,
      variacionGasto: -4,
      historial: meses.slice(-4).map(mes => ({
        fecha: `${this.mesLabel(mes)} ${mes.slice(5, 7)}`,
        estado: this.estadoDe(scores[mes]),
        score: scores[mes],
        ingresos: ingresos[mes],
        gastos: gastos[mes]
      })).reverse()
    };
  }

  private estadoDe(score: number): EvolutionData['perfilMensual'][number]['estado'] {
    if (score >= 85) return 'Saludable';
    if (score >= 60) return 'En observación';
    return 'En riesgo';
  }

  private mesLabel(mes: string): string {
    const [year, month] = mes.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }
}
