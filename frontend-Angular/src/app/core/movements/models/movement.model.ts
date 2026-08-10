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
  date: string;
  userId?: number;
  status?: string;
  modelSuggestion?: AiClassificationSuggestion;
}

export interface CreateMovementRequest {
  description: string;
  amount: number;
  type: 'INGRESO' | 'GASTO';
  category?: string;
  date: string;
  userId?: number;
}

export interface ConfirmMovementRequest {
  category: string;
  regularity?: string;
  debtId?: number | null;
}
