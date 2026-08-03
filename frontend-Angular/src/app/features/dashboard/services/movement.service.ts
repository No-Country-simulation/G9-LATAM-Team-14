import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movement } from '../../../models/movement.model';
@Injectable({
  providedIn: 'root'
})
export class MovementService {

  private apiUrl = 'http://localhost:8080/api/movements';

  constructor(private http: HttpClient) {}

  getMovements(): Observable<Movement[]> {
    return this.http.get<Movement[]>(this.apiUrl, {
      withCredentials: true
    });
  }

  createMovement(movement: any): Observable<any> {
    return this.http.post(this.apiUrl, movement, {
      withCredentials: true
    });
  }

}
