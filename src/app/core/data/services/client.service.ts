import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  // Ajusta si usas environments
  private baseUrl = 'http://localhost:3002/api';

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/getCliente`);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/getCliente/${id}`);
  }
}
