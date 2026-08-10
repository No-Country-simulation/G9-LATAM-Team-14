import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type SavingHabit = 'nunca' | 'baja' | 'media' | 'alta';

export type IncomeModality =
  | 'fijo'
  | 'variable'
  | 'mixto'
  | 'estacional'
  | 'apoyo'
  | 'sin_ingresos';

export interface FinancialProfileInput {
  monthly_net_income: number;
  saving_habit: SavingHabit;
  debt_ratio_percentage: number | null;
  debt_types: string[];
  primary_activity: string;
  primary_income_modality: IncomeModality;
  has_additional_income: boolean;
  additional_activity: string;
  additional_income_modality: IncomeModality | '';
  next_goal: string;
  hobbies: string[];
  financial_responsibility: string;
}

export interface DeclaredProfileData {
  monthly_net_income: number;
  saving_habit: SavingHabit;
  debt_ratio_percentage: number | null;
  debt_types: string[];
  primary_activity: string;
  primary_income_modality: IncomeModality;
  additional_income: {
    activity: string;
    modality: IncomeModality;
  } | null;
  next_goal: string;
  hobbies: string[];
  financial_responsibility: string;
}

export interface ActivityAlternative {
  activity: string;
  percentage: number;
}

export interface ProfileClassification {
  mvp_scope: string;
  primary_activity: string;
  secondary_activity: string;
  cuoc_occupation: string;
  cuoc_code: string;
  confidence_percentage: number;
  alternative_activities: ActivityAlternative[];
  hobbies: string[];
  out_of_mvp_hobbies: string[];
  debt_status: string;
  saving_status: string;
  reason: string;
  ethical_principle: string;
  model_version: string;
}

export interface FinancialProfile {
  id: number;
  declared_data: DeclaredProfileData;
  classification: ProfileClassification;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  profile: FinancialProfile;
}

export interface ProfileMutationResponse extends ProfileResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly http = inject(HttpClient);
  private readonly profilesUrl = `${environment.apiUrl}/profiles`;

  getMine(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.profilesUrl}/me/`);
  }

  create(data: FinancialProfileInput): Observable<ProfileMutationResponse> {
    return this.http.post<ProfileMutationResponse>(`${this.profilesUrl}/`, data);
  }

  update(data: FinancialProfileInput): Observable<ProfileMutationResponse> {
    return this.http.patch<ProfileMutationResponse>(
      `${this.profilesUrl}/me/`,
      data,
    );
  }
}
