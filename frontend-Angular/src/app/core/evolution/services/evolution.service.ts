import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { EvolutionData } from '../models/evolution.model';

@Injectable({
  providedIn: 'root'
})
export class EvolutionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/evolucion`;

  getEvolution(): Observable<EvolutionData> {
    return this.http.get<EvolutionData>(this.apiUrl, { withCredentials: true });
  }
}
