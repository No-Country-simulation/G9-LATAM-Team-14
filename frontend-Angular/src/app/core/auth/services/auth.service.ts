import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { AuthResponse, LoginRequest, UserInfo } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';

  // signal para mantener el estado del usuario en toda la app
  currentUser = signal<UserInfo | null>(null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true // Permite recibir la Cookie HttpOnly del backend
    }).pipe(
      tap(response => {
        this.currentUser.set(response.user);
      })
    );
  }

  // comprueba la cokie llamando al backend al cargar/recargar la app
  checkSession(): Observable<boolean> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`, {
      withCredentials: true
    }).pipe(
      tap(response => this.currentUser.set(response.user)),
      map(() => true),
      catchError(() => {
        this.currentUser.set(null);
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => this.currentUser.set(null))
    );
  }
}