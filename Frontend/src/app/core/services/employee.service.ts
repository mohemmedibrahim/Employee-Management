import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeQuery, EmployeeRequest } from '../../models/employee.model';

/** Talks to the backend EmployeesController (api/employees). */
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/employees`;

  /**
   * GET /api/employees?name=...&departmentId=...
   * Both query parameters are optional (search by name, filter by department).
   */
  getAll(query: EmployeeQuery = {}): Observable<Employee[]> {
    let params = new HttpParams();

    const name = query.name?.trim();
    if (name) {
      params = params.set('name', name);
    }
    if (query.departmentId !== null && query.departmentId !== undefined) {
      params = params.set('departmentId', query.departmentId);
    }

    return this.http.get<Employee[]>(this.url, { params });
  }

  /** GET /api/employees/{id} */
  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.url}/${id}`);
  }

  /** POST /api/employees -> 201 Created */
  create(payload: EmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(this.url, payload);
  }

  /** PUT /api/employees/{id} -> 200 OK */
  update(id: number, payload: EmployeeRequest): Observable<Employee> {
    return this.http.put<Employee>(`${this.url}/${id}`, payload);
  }

  /** DELETE /api/employees/{id} -> 204 No Content */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
