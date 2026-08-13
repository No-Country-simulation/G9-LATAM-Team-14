import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import {
  AuthenticatedUserResponse,
  AuthUser,
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
  RegisterCredentials,
  RegisterResponse,
} from '../models/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly currentUserState = signal<AuthUser | null>(null);
  private readonly authUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = this.currentUserState.asReadonly();

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.authUrl}/login/`, credentials)
      .pipe(tap((response) => this.currentUserState.set(response.user)));
  }

  register(credentials: RegisterCredentials): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.authUrl}/register/`,
      credentials,
    );
  }

  me(): Observable<AuthenticatedUserResponse> {
    return this.http
      .get<AuthenticatedUserResponse>(`${this.authUrl}/me/`)
      .pipe(tap((response) => this.currentUserState.set(response.user)));
  }

  logout(): Observable<LogoutResponse> {
    return this.http
      .post<LogoutResponse>(`${this.authUrl}/logout/`, {})
      .pipe(tap(() => this.currentUserState.set(null)));
  }

  clearCurrentUser(): void {
    this.currentUserState.set(null);
  }
}
