import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '@environments/environment';
import {
  Debt,
  DebtStatus,
  CreateDebtRequest,
  CreateBatchDebtsRequest,
  DebtSummary,
  DebtProjectionPoint,
  DebtProjectionResponse,
  SingleDebtItemRequest
} from '../models/debt.model';
@Injectable({
  providedIn: 'root'
})
export class DebtService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/debts`;
  private onboardingUrl = `${environment.apiUrl}/v1/onboarding/debts`;
  onboardingDebts = signal<SingleDebtItemRequest[]>([
    { category: '', amount: null }
  ]);

  saveOnboardingDebtsToBackend(userId: number = 1): Observable<Debt[]> {
    const validDebts = this.onboardingDebts()
      .filter(d => d.category && d.amount && d.amount > 0)
      .map(d => ({ category: d.category, amount: d.amount }));

    if (validDebts.length === 0) {
      return of([]);
    }

    return this.createBatchOnboardingDebts({
      userId,
      debts: validDebts
    });
  }

  getDebts(status?: DebtStatus, userId: number = 1): Observable<Debt[]> {
    let params = new HttpParams().set('userId', userId.toString());
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Debt[]>(this.apiUrl, { params, withCredentials: true });
  }

  getDebtById(id: number): Observable<Debt> {
    return this.http.get<Debt>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getSummary(userId: number = 1): Observable<DebtSummary> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<DebtSummary>(`${this.apiUrl}/summary`, { params, withCredentials: true });
  }

  getProjection(userId: number = 1): Observable<DebtProjectionPoint[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<DebtProjectionResponse>(`${this.apiUrl}/projection`, { params, withCredentials: true })
      .pipe(map(res => res.projection || []));
  }

  createDebt(request: CreateDebtRequest): Observable<Debt> {
    return this.http.post<Debt>(this.apiUrl, request, { withCredentials: true });
  }

  createBatchOnboardingDebts(request: CreateBatchDebtsRequest): Observable<Debt[]> {
    return this.http.post<Debt[]>(this.onboardingUrl, request, { withCredentials: true });
  }

  updateDebt(id: number, debt: Partial<Debt>): Observable<Debt> {
    return this.http.put<Debt>(`${this.apiUrl}/${id}`, debt, { withCredentials: true });
  }

  deleteDebt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  payInstallment(id: number): Observable<Debt> {
    return this.http.patch<Debt>(`${this.apiUrl}/${id}/pay-installment`, {}, { withCredentials: true });
  }
}
