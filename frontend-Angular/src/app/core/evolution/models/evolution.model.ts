export type TimeRange = '3M' | '6M' | '1A';

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

export interface CategoryExpense {
  categoria: string;
  monto: number;
  porcentaje: number;
}

export interface AnalysisHistoryRow {
  fecha: string;
  estado: EstadoFinanciero;
  score: number;
  ingresos: number;
  gastos: number;
}

export interface EvolutionData {
  rango: TimeRange;
  ultimoMes: string;
  ultimoScore: number;
  perfilMensual: MonthlyProfile[];
  ingresosVsGastos: IncomeVsExpensesPoint[];
  gastosPorCategoria: CategoryExpense[];
  gastoTotalMes: number;
  variacionGasto: number;
  historial: AnalysisHistoryRow[];
}

export interface EvolutionResponse {
  rango: TimeRange;
  ultimoMes: string;
  ultimoScore: number;
  perfilMensual: MonthlyProfile[];
  ingresosVsGastos: IncomeVsExpensesPoint[];
  gastosPorCategoria: CategoryExpense[];
  gastoTotalMes: number;
  variacionGasto: number;
  historial: AnalysisHistoryRow[];
}
