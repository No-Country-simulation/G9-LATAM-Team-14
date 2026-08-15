import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface UserProfileResponse {
  userId: number;
  email: string;
  nombreUsuario: string;
  ingresoMensual: number;
  actividadPrincipal: string;
  frecuenciaAhorro: string;
  ocupacionCuoc?: string;
  confianzaIaPct?: number;
  resultadoIaJson?: string;
  onboardingCompleted?: boolean;
  primaryIncomeModality?: string;
  nextGoal?: string;
  hobbies?: string[];
  financialResponsibility?: string;
}

export interface UpdateProfilePayload {
  monthlyNetIncome?: number;
  primaryActivity?: string;
  primaryIncomeModality?: string;
  nextGoal?: string;
  hobbies?: string[];
  financialResponsibility?: string;
  savingHabit?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/profile`;

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(this.apiUrl, { withCredentials: true });
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(this.apiUrl, payload, { withCredentials: true });
  }
}
