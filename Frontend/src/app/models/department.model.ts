/** Mirrors the backend DepartmentDto (response). */
export interface Department {
  id: number;
  name: string;
  description: string | null;
  employeeCount: number;
}

/** Mirrors the backend CreateDepartmentDto / UpdateDepartmentDto (request body). */
export interface DepartmentRequest {
  name: string;
  description: string | null;
}
