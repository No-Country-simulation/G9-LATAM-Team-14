import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@environments/environment';
import { Debt, SingleDebtItemRequest, CreateBatchDebtsRequest } from '@core/debts/models/debt.model';

export interface SecondaryIncome {
  activity: string;
  modality: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private http = inject(HttpClient);
  private onboardingDebtsUrl = `${environment.apiUrl}/v1/onboarding/debts`;

  onboardingIncome = signal<number | null>(null);
  primaryActivity = signal<string>('');
  primaryModality = signal<string>('');
  secondaryIncomes = signal<SecondaryIncome[]>([]);

  primaryGoal = signal<string>('');
  hobbies = signal<string>('');
  workSupport = signal<string>('');
  hobbiesList = signal<string[]>([]);
  workSupportList = signal<string[]>([]);

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

    const request: CreateBatchDebtsRequest = {
      userId,
      debts: validDebts
    };

    return this.http.post<Debt[]>(this.onboardingDebtsUrl, request, { withCredentials: true });
  }
}

