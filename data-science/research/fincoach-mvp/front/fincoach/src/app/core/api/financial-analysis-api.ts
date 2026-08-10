import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface FinancialAnalysisSummary {
  total_income: number;
  total_expenses: number;
  fixed_expenses: number;
  variable_expenses: number;
  debt_payments: number;
  available_balance: number;
  saving_capacity: number;
}

export interface FinancialAnalysisResponse {
  month: string;
  financial_status: {
    classification: string;
    trajectory: string;
    confidence_percentage: number;
  };
  summary: FinancialAnalysisSummary;
  top_expense_categories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  alerts: unknown[];
  recommendation: {
    status: string;
    code?: string;
    message?: string;
  };
  evidence: {
    status: string;
    observed_period: Record<string, unknown>;
    reasons: unknown[];
    main_factors: unknown[];
  };
}

@Injectable({ providedIn: 'root' })
export class FinancialAnalysisApi {
  private readonly http = inject(HttpClient);
  private readonly analysisUrl = `${environment.apiUrl}/financial-analysis/`;

  analyze(month: string): Observable<FinancialAnalysisResponse> {
    return this.http.post<FinancialAnalysisResponse>(this.analysisUrl, {
      month,
    });
  }
}
