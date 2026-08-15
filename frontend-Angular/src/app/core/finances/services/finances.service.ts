import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface FactorObserved {
  name: string;
  assessment: string;
}

export interface FinancialStatus {
  status: string;
  currentState: string;
  trajectory: string;
  confidencePercentage: number;
  daysWithHistory: number;
  confirmedMovements: number;
  dateRangeText: string;
  mainFactors: FactorObserved[];
}

export interface FinancialRecommendation {
  status: string;
  priority: string;
  strategy: string;
  message: string;
  nextAction: string;
  confidencePercentage: number;
  relatedGoal: string;
  appliedSafeguards: string[];
  reasons?: string[];
}

export interface FinancesDataResponse {
  periodDays: number;
  financialStatus: FinancialStatus;
  financialRecommendation: FinancialRecommendation;
}

@Injectable({
  providedIn: 'root'
})
export class FinancesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/finances`;

  getFinances(periodDays: number = 60): Observable<FinancesDataResponse> {
    return this.http.get<FinancesDataResponse>(`${this.apiUrl}?periodDays=${periodDays}`, { withCredentials: true });
  }
}
