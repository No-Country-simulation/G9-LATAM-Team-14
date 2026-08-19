export interface AiAlternativeCategory {
  category: string;
  percentage: number;
}

export interface AiClassificationSuggestion {
  category: string;
  categoryConfidencePercentage: number;
  alternativeCategories: AiAlternativeCategory[];
  purpose: string;
  regularity: string;
  modelRequiresReview: boolean;
}

export interface Movement {
  id: number;
  description: string;
  amount: number;
  type: 'INGRESO' | 'GASTO';
  category: string;
  regularity?: 'fijo' | 'variable';
  date: string;
  note?: string;
  userId?: number;
  debtId?: number;
  debtPaymentApplied?: boolean;
  status?: string;
  modelSuggestion?: AiClassificationSuggestion;
}

export interface CreateMovementRequest {
  description: string;
  amount: number;
  type: 'INGRESO' | 'GASTO';
  category?: string;
  regularity?: 'fijo' | 'variable';
  date: string;
  note?: string;
  userId?: number;
  debtId?: number;
}

export interface ConfirmMovementRequest {
  category: string;
  regularity?: string;
  debtId?: number | null;
}
