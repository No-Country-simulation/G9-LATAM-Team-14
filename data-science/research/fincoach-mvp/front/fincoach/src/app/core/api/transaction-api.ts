import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface TransactionCategory {
  category: string;
  percentage: number;
}

export type TransactionRegularity = 'fijo' | 'variable';

export interface TransactionModelSuggestion {
  category: string;
  category_confidence_percentage: number;
  top_categories: TransactionCategory[];
  purpose: string;
  purpose_confidence_percentage: number;
  regularity: TransactionRegularity;
  regularity_confidence_percentage: number;
  model_requires_review: boolean;
  confirmation_probability_percentage: number;
  rule: string;
  model_version: string;
}

export interface TransactionFinalClassification {
  categories: TransactionCategory[];
  purpose: string;
  regularity: TransactionRegularity;
  source: string;
  debt_id: number | null;
}

export interface FinancialTransaction {
  id: number;
  transaction_date: string;
  description: string;
  note: string;
  amount: number;
  currency: string;
  direction: 'entrada' | 'salida';
  status: 'pending_classification' | 'awaiting_confirmation' | 'confirmed';
  movement_type: string | null;
  model_suggestion: TransactionModelSuggestion | null;
  final_classification: TransactionFinalClassification | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionPagination {
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
}

export interface TransactionListResponse {
  pagination: TransactionPagination;
  transactions: FinancialTransaction[];
}

export interface TransactionInput {
  transaction_date: string;
  description: string;
  note: string;
  amount: number;
  direction: 'entrada' | 'salida';
}

export interface RegisteredTransaction {
  id: number;
  transaction_date: string;
  description: string;
  note: string;
  amount: number;
  currency: string;
  direction: 'entrada' | 'salida';
  status: 'pending_classification';
}

export interface TransactionCreateResponse {
  message: string;
  transaction: RegisteredTransaction;
  next_step: {
    method: string;
    endpoint: string;
  };
}

export interface ClassificationSuggestion {
  category: string;
  category_confidence_percentage: number;
  alternative_categories: TransactionCategory[];
  purpose: string;
  regularity: TransactionRegularity;
  model_requires_review: boolean;
}

export interface TransactionClassifyResponse {
  message: string;
  transaction_id: number;
  status: 'awaiting_confirmation';
  model_suggestion: ClassificationSuggestion;
  user_confirmation_required: true;
  next_step: {
    method: string;
    endpoint: string;
  };
}

export interface TransactionConfirmInput {
  selected_categories: TransactionCategory[];
  selected_purpose?: string;
  selected_regularity: TransactionRegularity;
  selected_debt_id?: number;
}

export interface TransactionConfirmResponse {
  message: string;
  transaction_id: number;
  status: 'confirmed';
  confirmed_classification: {
    categories: TransactionCategory[];
    purpose: string;
    regularity: TransactionRegularity;
    debt_id: number | null;
  };
  classification_result: string;
  was_corrected: boolean;
  revision_count: number;
}

@Injectable({ providedIn: 'root' })
export class TransactionApi {
  private readonly http = inject(HttpClient);
  private readonly transactionsUrl = `${environment.apiUrl}/transactions`;

  getLatest(limit = 10): Observable<TransactionListResponse> {
    const params = new HttpParams()
      .set('page', 1)
      .set('page_size', limit);

    return this.http.get<TransactionListResponse>(
      `${this.transactionsUrl}/`,
      { params },
    );
  }

  getByMonth(month: string, limit = 100): Observable<TransactionListResponse> {
    const params = new HttpParams()
      .set('month', month)
      .set('page', 1)
      .set('page_size', limit);

    return this.http.get<TransactionListResponse>(
      `${this.transactionsUrl}/`,
      { params },
    );
  }

  getConfirmedByMonth(
    month: string,
    limit = 100,
  ): Observable<TransactionListResponse> {
    const params = new HttpParams()
      .set('month', month)
      .set('status', 'confirmed')
      .set('page', 1)
      .set('page_size', limit);

    return this.http.get<TransactionListResponse>(
      `${this.transactionsUrl}/`,
      { params },
    );
  }

  create(data: TransactionInput): Observable<TransactionCreateResponse> {
    return this.http.post<TransactionCreateResponse>(
      `${this.transactionsUrl}/`,
      data,
    );
  }

  classify(transactionId: number): Observable<TransactionClassifyResponse> {
    return this.http.post<TransactionClassifyResponse>(
      `${this.transactionsUrl}/${transactionId}/classify/`,
      {},
    );
  }

  confirm(
    transactionId: number,
    data: TransactionConfirmInput,
  ): Observable<TransactionConfirmResponse> {
    return this.http.patch<TransactionConfirmResponse>(
      `${this.transactionsUrl}/${transactionId}/confirm/`,
      data,
    );
  }
}
