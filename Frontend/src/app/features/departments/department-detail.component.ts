import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfirmService } from '../../core/services/confirm.service';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { initials } from '../../core/utils/form.utils';
import { errorMessage } from '../../models/api-error.model';
import { Department } from '../../models/department.model';
import { Employee } from '../../models/employee.model';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner.component';
import { IconComponent } from '../../shared/components/icon.component';
import { LoadingComponent } from '../../shared/components/loading.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { DepartmentFormDialogComponent } from './department-form-dialog.component';

/** Department details page: department info + the employees who work in it. */
@Component({
  selector: 'app-department-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    IconComponent,
    PageHeaderComponent,
    LoadingComponent,
    ErrorBannerComponent,
    EmptyStateComponent,
    DepartmentFormDialogComponent,
  ],
  template: `
    <a class="back-link" routerLink="/departments"><app-icon name="back" [size]="16" /> Back to departments</a>

    @if (loading() && !department()) {
      <app-loading message="Loading department…" />
    } @else if (error(); as message) {
      <app-error-banner [message]="message" (retry)="load()" />
    } @else if (department(); as dept) {
      <app-page-header [title]="dept.name" subtitle="Department details">
        <button type="button" class="btn btn-secondary" (click)="editing.set(true)">
          <app-icon name="edit" [size]="16" /> Edit
        </button>
        <button type="button" class="btn btn-danger" (click)="delete(dept)">
          <app-icon name="trash" [size]="16" /> Delete
        </button>
      </app-page-header>

      <section class="card">
        <dl class="detail-grid">
          <div>
            <dt>Name</dt>
            <dd>{{ dept.name }}</dd>
          </div>
          <div>
            <dt>Employees</dt>
            <dd>{{ dept.employeeCount }}</dd>
          </div>
          <div class="detail-wide">
            <dt>Description</dt>
            <dd>{{ dept.description || 'No description provided.' }}</dd>
          </div>
        </dl>
      </section>

      <section class="card">
        <div class="card-header">
          <h2 class="card-title">Employees in {{ dept.name }}</h2>
          <a class="btn btn-primary btn-sm" routerLink="/employees/new">
            <app-icon name="plus" [size]="14" /> Add Employee
          </a>
        </div>

        @if (employees().length > 0) {
          <div class="table-wrap">
            <table class="table stack-mobile">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th class="text-right">Salary</th>
                </tr>
              </thead>
              <tbody>
                @for (employee of employees(); track employee.id) {
                  <tr>
                    <td data-label="Employee">
                      <a class="person" [routerLink]="['/employees', employee.id]">
                        <span class="avatar">{{ initials(employee.name) }}</span>
                        <span class="person-text">
                          <strong>{{ employee.name }}</strong>
                          <small>{{ employee.email }}</small>
                        </span>
                      </a>
                    </td>
                    <td data-label="Phone">{{ employee.phone }}</td>
                    <td data-label="Joined">{{ employee.joiningDate | date: 'dd MMM yyyy' }}</td>
                    <td data-label="Salary" class="text-right">
                      {{ employee.salary | currency: currencyCode : 'symbol' : '1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <app-empty-state
            icon="employees"
            title="No employees in this department"
            message="Employees you assign to this department will be listed here."
          />
        }
      </section>

      @if (editing()) {
        <app-department-form-dialog [department]="dept" (saved)="onSaved($event)" (closed)="editing.set(false)" />
      }
    }
  `,
})
export class DepartmentDetailComponent {
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly notifications = inject(NotificationService);
  private readonly confirmService = inject(ConfirmService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly currencyCode = environment.currencyCode;
  protected readonly initials = initials;

  protected readonly department = signal<Department | null>(null);
  protected readonly employees = signal<Employee[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly editing = signal(false);

  constructor() {
    this.load();
  }

  protected load(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.error.set('The department id in the address is not valid.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      department: this.departmentService.getById(this.id),
      employees: this.employeeService.getAll({ departmentId: this.id }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ department, employees }) => {
          this.department.set(department);
          this.employees.set(employees);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(errorMessage(err));
          this.loading.set(false);
        },
      });
  }

  protected onSaved(department: Department): void {
    this.editing.set(false);
    this.notifications.success(`Department "${department.name}" was updated.`);
    this.load();
  }

  protected async delete(department: Department): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Delete department?',
      message: `"${department.name}" will be permanently deleted. A department that still has employees cannot be deleted.`,
      confirmText: 'Delete',
      danger: true,
    });

    if (!confirmed) {
      return;
    }

    this.departmentService
      .delete(department.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.success(`Department "${department.name}" was deleted.`);
          void this.router.navigate(['/departments']);
        },
        error: (err: unknown) => this.notifications.error(errorMessage(err)),
      });
  }
}
