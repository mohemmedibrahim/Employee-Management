/** Mirrors the backend EmployeeDto (response). */
export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  salary: number;
  /** ISO date-time without time zone, e.g. "2026-01-15T00:00:00". */
  joiningDate: string;
  departmentId: number;
  departmentName: string;
}

/** Mirrors the backend CreateEmployeeDto / UpdateEmployeeDto (request body). */
export interface EmployeeRequest {
  name: string;
  email: string;
  phone: string;
  salary: number;
  joiningDate: string;
  departmentId: number;
}

/** Optional query parameters of GET /api/employees. */
export interface EmployeeQuery {
  name?: string;
  departmentId?: number | null;
}
