import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Occupation {
  id: number;
  name: string;
  category: 'I' | 'II' | 'III';
}

@Injectable({ providedIn: 'root' })
export class OccupationService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3002/api';

  getAll(): Observable<Occupation[]> {
    return this.http.get<Occupation[]>(`${this.baseUrl}/getOccupations`);
  }
}
