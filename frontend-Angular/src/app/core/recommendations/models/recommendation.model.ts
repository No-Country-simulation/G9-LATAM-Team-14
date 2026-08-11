export type Prioridad = 'ALTA' | 'MEDIA' | 'BAJA';

export interface Recommendation {
  id: number;
  prioridad: Prioridad;
  categoria: string;
  titulo: string;
  descripcion: string;
  insight: string;
  accionLabel: string;
  impacto: number;
  completada: boolean;
  fecha: string;
}

export interface Score {
  scoreActual: number;
  scorePotencial: number;
  accionesCompletadas: number;
  accionesTotales: number;
}
