import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import {
  Debt,
  DebtStatus,
  CreateDebtRequest,
  DebtSummary,
  DebtProjectionPoint,
  DebtProjectionResponse
} from '../models/debt.model';

@Injectable({
  providedIn: 'root'
})
export class DebtService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/debts`;

  getDebts(status?: DebtStatus, userId?: number): Observable<Debt[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Debt[]>(this.apiUrl, { params, withCredentials: true });
  }

  getDebtById(id: number): Observable<Debt> {
    return this.http.get<Debt>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getSummary(userId?: number): Observable<DebtSummary> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    return this.http.get<DebtSummary>(`${this.apiUrl}/summary`, { params, withCredentials: true });
  }

  getProjection(userId?: number): Observable<DebtProjectionPoint[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    return this.http.get<DebtProjectionResponse>(`${this.apiUrl}/projection`, { params, withCredentials: true })
      .pipe(map(res => res.projection || []));
  }

  createDebt(request: CreateDebtRequest): Observable<Debt> {
    return this.http.post<Debt>(this.apiUrl, request, { withCredentials: true });
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
