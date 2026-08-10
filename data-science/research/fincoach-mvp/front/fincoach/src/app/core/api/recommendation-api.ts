import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface FinancialFactor {
  factor: string;
  assessment: string;
}

export interface RecommendationResponse {
  financial_state: {
    status: 'calculated' | 'requires_review' | 'insufficient_evidence';
    state: string;
    challenge_state: string;
    confidence_percentage: number | null;
    observed_period: {
      from: string;
      to: string;
      days_with_history: number;
      confirmed_transactions: number;
    };
    main_factors: FinancialFactor[];
    reasons: string[];
  };
  recommendation: {
    status: 'available' | 'not_available';
    code: string | null;
    message: string;
    action?: string;
    type?: string;
    priority?: string;
    human_review?: string;
    confidence_percentage: number | null;
    selection_source?: string;
    applied_safeguards: string[];
    related_goal?: string | null;
    reasons: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class RecommendationApi {
  private readonly http = inject(HttpClient);
  private readonly recommendationsUrl = `${environment.apiUrl}/recommendations/`;

  getCurrent(): Observable<RecommendationResponse> {
    return this.http.get<RecommendationResponse>(this.recommendationsUrl);
  }
}
