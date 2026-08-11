import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@environments/environment';
import { Recommendation, Score } from '../models/recommendation.model';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/recomendaciones`;
  private scoreUrl = `${environment.apiUrl}/usuario/score`;

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(this.apiUrl, { withCredentials: true });
  }

  getScore(): Observable<Score> {
    return this.http.get<Score>(this.scoreUrl, { withCredentials: true });
  }

  completeRecommendation(id: number): Observable<Score> {
    return this.http.post<Score>(`${this.apiUrl}/${id}/completar`, {}, { withCredentials: true });
  }

  getMockRecommendations(): Observable<Recommendation[]> {
    return of(this.buildMockRecommendations());
  }

  getMockScore(): Observable<Score> {
    return of(this.buildMockScore());
  }

  private buildMockRecommendations(): Recommendation[] {
    return [
      {
        id: 1,
        prioridad: 'ALTA',
        categoria: 'Transporte',
        titulo: 'Reduce tus gastos de transporte',
        descripcion: 'Tus gastos de transporte superan el presupuesto sugerido este mes.',
        insight: 'Pequeños ajustes en tus traslados diarios liberan dinero para tus metas.',
        accionLabel: 'Implementar',
        impacto: 8,
        completada: false,
        fecha: '2026-08-06'
      },
      {
        id: 2,
        prioridad: 'ALTA',
        categoria: 'Ahorro',
        titulo: 'Aumenta tu reserva de ahorro mensual',
        descripcion: 'Tu frecuencia de ahorro es baja frente a tu capacidad disponible.',
        insight: 'Ahorrar de forma constante es el primer paso hacia tu tranquilidad financiera.',
        accionLabel: 'Configurar',
        impacto: 9,
        completada: true,
        fecha: '2026-08-06'
      },
      {
        id: 3,
        prioridad: 'MEDIA',
        categoria: 'Ocio',
        titulo: 'Revisa tus suscripciones de ocio',
        descripcion: 'Detectamos gastos recurrentes de entretenimiento que podrías optimizar.',
        insight: 'Cancelar lo que no usas es la forma más rápida de ahorrar sin esfuerzo.',
        accionLabel: 'Verificar',
        impacto: 5,
        completada: false,
        fecha: '2026-08-06'
      },
      {
        id: 4,
        prioridad: 'BAJA',
        categoria: 'Deudas',
        titulo: 'Adelanta la cuota de tu deuda con tasa alta',
        descripcion: 'Amortizar la deuda más cara reduce el interés total que pagas.',
        insight: 'Priorizar la deuda cara acelera tu camino hacia la libertad financiera.',
        accionLabel: 'Pagar',
        impacto: 4,
        completada: true,
        fecha: '2026-08-06'
      },
      {
        id: 5,
        prioridad: 'MEDIA',
        categoria: 'Ingresos',
        titulo: 'Diversifica tus fuentes de ingreso',
        descripcion: 'Tu ingreso depende de una sola fuente; considera alternativas para mayor estabilidad.',
        insight: 'Tener múltiples ingresos reduce el riesgo financiero ante imprevistos.',
        accionLabel: 'Explorar',
        impacto: 7,
        completada: false,
        fecha: '2026-08-06'
      },
      {
        id: 6,
        prioridad: 'BAJA',
        categoria: 'Presupuesto',
        titulo: 'Establece un presupuesto mensual por categoría',
        descripcion: 'No tener un límite definido puede hacer que los gastos se descontrolen.',
        insight: 'Un presupuesto claro te da control total sobre hacia dónde va tu dinero.',
        accionLabel: 'Definir',
        impacto: 3,
        completada: false,
        fecha: '2026-08-06'
      }
    ];
  }

  private buildMockScore(): Score {
    return {
      scoreActual: 62,
      scorePotencial: 79,
      accionesCompletadas: 2,
      accionesTotales: 6
    };
  }
}
