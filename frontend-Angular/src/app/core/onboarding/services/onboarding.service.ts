import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { SingleDebtItemRequest } from '@core/debts/models/debt.model';

export interface SecondaryIncome {
  activity: string;
  modality: string;
}

export interface CompleteOnboardingRequest {
  monthlyNetIncome: number;
  primaryActivity: string;
  primaryIncomeModality: string;
  nextGoal: string;
  debts: { category: string; amount: number }[];
  hobbies: string[];
  financialResponsibility: string;
  savingHabit: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private http = inject(HttpClient);
  private onboardingCompleteUrl = `${environment.apiUrl}/v1/onboarding/complete`;
  onboardingIncome = signal<number | null>(null);
  primaryActivity = signal<string>('');
  primaryModality = signal<string>('');
  secondaryIncomes = signal<SecondaryIncome[]>([]);
  nextGoal = signal<string>('');
  primaryGoal = signal<string>('');
  hobbies = signal<string>('');
  workSupport = signal<string>('');
  hobbiesList = signal<string[]>([]);
  workSupportList = signal<string[]>([]);
  onboardingDebts = signal<SingleDebtItemRequest[]>([
    { category: '', amount: null }
  ]);
  savingHabit = signal<string>('media');
  saveOnboardingData(): Observable<any> {
    const income = this.onboardingIncome() || 0;
    const activity = this.primaryActivity() || '';
    const modality = this.primaryModality() || 'fijo';
    const goal = this.nextGoal() || this.primaryGoal() || '';
    const validDebts = this.onboardingDebts()
      .filter(d => d.category && d.amount && d.amount > 0)
      .map(d => ({ category: d.category, amount: d.amount! }));
    const hobbies = this.hobbiesList();
    const financialResponsibility = this.workSupportList().join(', ');
    const payload: CompleteOnboardingRequest = {
      monthlyNetIncome: income,
      primaryActivity: activity,
      primaryIncomeModality: modality,
      nextGoal: goal,
      debts: validDebts,
      hobbies,
      financialResponsibility,
      savingHabit: this.savingHabit() || 'media'
    };

    return this.http.post(this.onboardingCompleteUrl, payload, { withCredentials: true });
  }
}
