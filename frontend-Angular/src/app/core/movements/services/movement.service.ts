import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Movement, CreateMovementRequest, ConfirmMovementRequest, AiClassificationSuggestion } from '../models/movement.model';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/movements`;

  getMovements(): Observable<Movement[]> {
    return this.http.get<Movement[]>(this.apiUrl, {
      withCredentials: true
    });
  }

  createMovement(movement: CreateMovementRequest): Observable<Movement> {
    return this.http.post<Movement>(this.apiUrl, movement, {
      withCredentials: true
    });
  }

  classifyMovement(movement: CreateMovementRequest): Observable<AiClassificationSuggestion> {
    return this.http.post<AiClassificationSuggestion>(`${this.apiUrl}/classify`, movement, {
      withCredentials: true
    });
  }

  confirmMovement(id: number, request: ConfirmMovementRequest): Observable<Movement> {
    return this.http.patch<Movement>(`${this.apiUrl}/${id}/confirm`, request, {
      withCredentials: true
    });
  }

  updateMovement(id: number, description: string, note?: string): Observable<Movement> {
    return this.http.put<Movement>(`${this.apiUrl}/${id}`, { description, note }, {
      withCredentials: true
    });
  }

  deleteMovement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
