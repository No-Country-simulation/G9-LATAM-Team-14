export type EstadoFinanciero = 'Saludable' | 'En observación' | 'En riesgo';

export interface MonthlyProfile {
  mes: string;
  score: number;
  estado: EstadoFinanciero;
}

export interface IncomeVsExpensesPoint {
  mes: string;
  ingresos: number;
  gastos: number;
  deudas: number;
}

export interface AnalysisHistoryRow {
  fecha: string;
  estado: EstadoFinanciero;
  score: number;
  ingresos: number;
  gastos: number;
}

export interface EvolutionData {
  ultimoMes: string;
  ultimoScore: number;
  perfilMensual: MonthlyProfile[];
  ingresosVsGastos: IncomeVsExpensesPoint[];
  historial: AnalysisHistoryRow[];
}
