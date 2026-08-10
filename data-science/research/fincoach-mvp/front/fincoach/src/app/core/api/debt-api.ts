import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface DebtListItem {
  id: number;
  type: DebtType;
  type_label: string;
  original_amount: number;
  outstanding_balance: number;
  confirmed_payments: number;
  monthly_payment: number;
  annual_effective_rate_percentage: number;
  estimated_total_interest: number;
  term_months: number;
  remaining_months: number | null;
  start_date: string;
  projected_end_date: string | null;
  progress_percentage: number;
  status: 'active' | 'paid';
}

export interface DebtListResponse {
  summary: {
    total_outstanding_balance: number;
    total_monthly_payment: number;
    projected_end_date: string | null;
    active_debts: number;
  };
  debts: DebtListItem[];
  evolution: Array<{
    month: string;
    outstanding_balance: number;
  }>;
}

export type DebtType =
  | 'housing'
  | 'educational'
  | 'credit_card'
  | 'vehicle'
  | 'personal';

export interface DebtInput {
  debt_type: DebtType;
  original_amount: number;
  term_months: number;
  start_date: string;
}

export interface DebtCreateResponse {
  message: string;
  debt: {
    id: number;
    type: DebtType;
    type_label: string;
    original_amount: number;
    monthly_payment: number;
    annual_effective_rate_percentage: number;
    estimated_total_interest: number;
    term_months: number;
    start_date: string;
    projected_end_date: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class DebtApi {
  private readonly http = inject(HttpClient);
  private readonly debtsUrl = `${environment.apiUrl}/debts`;

  getAll(): Observable<DebtListResponse> {
    return this.http.get<DebtListResponse>(`${this.debtsUrl}/`);
  }

  create(data: DebtInput): Observable<DebtCreateResponse> {
    return this.http.post<DebtCreateResponse>(`${this.debtsUrl}/`, data);
  }
}
