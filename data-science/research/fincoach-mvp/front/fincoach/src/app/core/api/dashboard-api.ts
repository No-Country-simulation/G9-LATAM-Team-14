import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ExpenseCategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialCompositionItem {
  type: 'fixed' | 'variable';
  amount: number;
  percentage: number;
}

export interface DashboardResponse {
  month: string;
  overview: {
    income: number;
    fixed_expenses: number;
    variable_expenses: number;
    available: number;
    expense_change_percentage: number | null;
    average_classification_confidence_percentage: number | null;
  };
  income_composition: FinancialCompositionItem[];
  expense_categories: ExpenseCategorySummary[];
}

export interface MonthlyTransaction {
  id: number;
  date: string;
  description: string;
  note: string;
  amount: number;
  currency: string;
  direction: 'entrada' | 'salida';
  categories: Array<{
    category: string;
    percentage: number;
  }>;
  purpose: string;
  regularity: string;
  confidence_percentage: number | null;
  debt_id: number | null;
}

export interface MonthlyAnalysisResponse {
  month: string;
  summary: {
    income: number;
    expenses: number;
    balance: number;
    top_expense_categories: ExpenseCategorySummary[];
  };
  pagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_items: number;
  };
  transactions: MonthlyTransaction[];
}

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);
  private readonly dashboardUrl = `${environment.apiUrl}/dashboard/`;
  private readonly monthlyAnalysisUrl = `${environment.apiUrl}/monthly-analysis/`;

  getDashboard(month?: string): Observable<DashboardResponse> {
    const params = month
      ? new HttpParams().set('month', month)
      : undefined;

    return this.http.get<DashboardResponse>(this.dashboardUrl, { params });
  }

  getMonthlyAnalysis(
    month?: string,
    page = 1,
  ): Observable<MonthlyAnalysisResponse> {
    let params = new HttpParams().set('page', page);
    if (month) {
      params = params.set('month', month);
    }

    return this.http.get<MonthlyAnalysisResponse>(this.monthlyAnalysisUrl, {
      params,
    });
  }

  exportMonthlyAnalysis(month: string): Observable<HttpResponse<Blob>> {
    const params = new HttpParams().set('month', month);

    return this.http.get(`${this.monthlyAnalysisUrl}export/`, {
      params,
      observe: 'response',
      responseType: 'blob',
    });
  }
}
