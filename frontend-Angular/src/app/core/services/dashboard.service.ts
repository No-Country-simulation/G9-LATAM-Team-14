import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '@environments/environment';

export interface DashboardSummaryResponse {
  totalIngresos: number;
  totalIngresosFijos: number;
  totalIngresosVariables: number;
  totalGastosFijos: number;
  totalGastosVariables: number;
  balanceNeto: number;
  alertas: string[];
  recomendaciones: string[];
  ocupacionCuoc?: string;
  confianzaIaPct?: number;
  actividadPrincipal?: string;
  resultadoIaJson?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardSummaryService {
  private http = inject(HttpClient);
  private summaryUrl = `${environment.apiUrl}/dashboard/summary`;

  summarySignal = signal<DashboardSummaryResponse | null>(null);

  getSummary(forceRefresh = false): Observable<DashboardSummaryResponse> {
    if (!forceRefresh && this.summarySignal()) {
      return of(this.summarySignal()!);
    }
    return this.http.get<DashboardSummaryResponse>(this.summaryUrl, { withCredentials: true }).pipe(
      tap(data => this.summarySignal.set(data))
    );
  }
}
