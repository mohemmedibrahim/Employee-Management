import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'departments',
    title: 'Departments',
    loadComponent: () =>
      import('./features/departments/department-list.component').then((m) => m.DepartmentListComponent),
  },
  {
    path: 'departments/:id',
    title: 'Department Details',
    loadComponent: () =>
      import('./features/departments/department-detail.component').then((m) => m.DepartmentDetailComponent),
  },
  {
    path: 'employees',
    title: 'Employees',
    loadComponent: () => import('./features/employees/employee-list.component').then((m) => m.EmployeeListComponent),
  },
  // "new" must come before ":id" so it is not treated as an employee id
  {
    path: 'employees/new',
    title: 'Add Employee',
    loadComponent: () => import('./features/employees/employee-form.component').then((m) => m.EmployeeFormComponent),
  },
  {
    path: 'employees/:id/edit',
    title: 'Edit Employee',
    loadComponent: () => import('./features/employees/employee-form.component').then((m) => m.EmployeeFormComponent),
  },
  {
    path: 'employees/:id',
    title: 'Employee Details',
    loadComponent: () =>
      import('./features/employees/employee-detail.component').then((m) => m.EmployeeDetailComponent),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
