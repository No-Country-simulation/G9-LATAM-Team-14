import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserInfo } from '../models/auth.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private _currentUser = signal<UserInfo | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.setUserFromResponse(response);
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.setUserFromResponse(response);
      })
    );
  }

  checkSession(): Observable<boolean> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`, {
      withCredentials: true
    }).pipe(
      tap(response => this.setUserFromResponse(response)),
      map(() => true),
      catchError(() => {
        this._currentUser.set(null);
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => this._currentUser.set(null))
    );
  }

  private setUserFromResponse(response: AuthResponse | null): void {
    if (!response) {
      this._currentUser.set(null);
      return;
    }

    if (response.user) {
      this._currentUser.set(response.user);
    } else if ((response as any).id) {
      this._currentUser.set(response as unknown as UserInfo);
    }
  }
}
