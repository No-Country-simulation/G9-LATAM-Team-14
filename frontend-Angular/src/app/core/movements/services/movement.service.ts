import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Movement, CreateMovementRequest } from '../models/movement.model';

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
}
