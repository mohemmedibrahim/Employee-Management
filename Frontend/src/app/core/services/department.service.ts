import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Department, DepartmentRequest } from '../../models/department.model';

/** Talks to the backend DepartmentsController (api/departments). */
@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/departments`;

  /** GET /api/departments */
  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.url);
  }

  /** GET /api/departments/{id} */
  getById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.url}/${id}`);
  }

  /** POST /api/departments -> 201 Created */
  create(payload: DepartmentRequest): Observable<Department> {
    return this.http.post<Department>(this.url, payload);
  }

  /** PUT /api/departments/{id} -> 200 OK */
  update(id: number, payload: DepartmentRequest): Observable<Department> {
    return this.http.put<Department>(`${this.url}/${id}`, payload);
  }

  /** DELETE /api/departments/{id} -> 204 No Content (409 if the department still has employees) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
