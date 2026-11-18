import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ConfirmService } from '../../core/services/confirm.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { initials } from '../../core/utils/form.utils';
import { errorMessage } from '../../models/api-error.model';
import { Employee } from '../../models/employee.model';
import { ErrorBannerComponent } from '../../shared/components/error-banner.component';
import { IconComponent } from '../../shared/components/icon.component';
import { LoadingComponent } from '../../shared/components/loading.component';

/** Employee details page. */
@Component({
  selector: 'app-employee-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, DatePipe, IconComponent, LoadingComponent, ErrorBannerComponent],
  template: `
    <a class="back-link" routerLink="/employees"><app-icon name="back" [size]="16" /> Back to employees</a>

    @if (loading()) {
      <app-loading message="Loading employee…" />
    } @else if (error(); as message) {
      <app-error-banner [message]="message" (retry)="load()" />
    } @else if (employee(); as emp) {
      <section class="card profile-card">
        <div class="profile-head">
          <span class="avatar avatar-lg">{{ initials(emp.name) }}</span>
          <div class="profile-title">
            <h1>{{ emp.name }}</h1>
            <a class="badge badge-link" [routerLink]="['/departments', emp.departmentId]">{{ emp.departmentName }}</a>
          </div>
          <div class="page-actions">
            <a class="btn btn-secondary" [routerLink]="['/employees', emp.id, 'edit']">
              <app-icon name="edit" [size]="16" /> Edit
            </a>
            <button type="button" class="btn btn-danger" (click)="delete(emp)">
              <app-icon name="trash" [size]="16" /> Delete
            </button>
          </div>
        </div>

        <dl class="detail-grid">
          <div>
            <dt><app-icon name="mail" [size]="14" /> Email</dt>
            <dd><a class="link" [href]="'mailto:' + emp.email">{{ emp.email }}</a></dd>
          </div>
          <div>
            <dt><app-icon name="phone" [size]="14" /> Phone</dt>
            <dd>{{ emp.phone }}</dd>
          </div>
          <div>
            <dt><app-icon name="payroll" [size]="14" /> Salary</dt>
            <dd>{{ emp.salary | currency: currencyCode : 'symbol' : '1.2-2' }}</dd>
          </div>
          <div>
            <dt><app-icon name="calendar" [size]="14" /> Joining Date</dt>
            <dd>{{ emp.joiningDate | date: 'dd MMMM yyyy' }}</dd>
          </div>
          <div>
            <dt><app-icon name="departments" [size]="14" /> Department</dt>
            <dd>{{ emp.departmentName }}</dd>
          </div>
          <div>
            <dt>Employee ID</dt>
            <dd>#{{ emp.id }}</dd>
          </div>
        </dl>
      </section>
    }
  `,
})
export class EmployeeDetailComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly notifications = inject(NotificationService);
  private readonly confirmService = inject(ConfirmService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly currencyCode = environment.currencyCode;
  protected readonly initials = initials;

  protected readonly employee = signal<Employee | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.error.set('The employee id in the address is not valid.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.employeeService
      .getById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (employee) => {
          this.employee.set(employee);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(errorMessage(err));
          this.loading.set(false);
        },
      });
  }

  protected async delete(employee: Employee): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Delete employee?',
      message: `${employee.name} will be permanently removed. This action cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });

    if (!confirmed) {
      return;
    }

    this.employeeService
      .delete(employee.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.success(`${employee.name} was deleted.`);
          void this.router.navigate(['/employees']);
        },
        error: (err: unknown) => this.notifications.error(errorMessage(err)),
      });
  }
}
