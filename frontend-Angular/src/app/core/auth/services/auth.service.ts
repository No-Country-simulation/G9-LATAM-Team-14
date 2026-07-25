// app/core/auth/services/auth.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserInfo } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';

  // Signal reactivo para mantener el estado global del usuario autenticado
  currentUser = signal<UserInfo | null>(null);

  /**
   * Registra un nuevo usuario en la aplicación y establece la cookie JWT de sesión.
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.currentUser.set(response.user);
      })
    );
  }

  /**
   * Inicia sesión con credenciales y guarda la cookie JWT (HttpOnly).
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.currentUser.set(response.user);
      })
    );
  }

  /**
   * Verifica la cookie JWT actual llamando a /api/auth/me.
   * Si es válida, actualiza el usuario reactivo y extiende/recrea la sesión JWT.
   */
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

  /**
   * Cierra la sesión activa eliminando la cookie de autenticación.
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => this.currentUser.set(null))
    );
  }
}
