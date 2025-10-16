import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Intermediario } from '../models/intermediary.model';

@Injectable({ providedIn: 'root' })
export class IntermediarioService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3002/api'; // o el puerto donde tengas Mockoon

  getAll(): Observable<Intermediario[]> {
    return this.http.get<Intermediario[]>(`${this.baseUrl}/getintermediary`);
  }
}
