import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, of, startWith, switchMap, tap } from 'rxjs';
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

@Component({
  selector: 'app-employee-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    IconComponent,
    PageHeaderComponent,
    LoadingComponent,
    ErrorBannerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './employee-list.component.html',
})
export class EmployeeListComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly notifications = inject(NotificationService);
  private readonly confirmService = inject(ConfirmService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currencyCode = environment.currencyCode;
  protected readonly initials = initials;

  protected readonly employees = signal<Employee[]>([]);
  protected readonly departments = signal<Department[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Search by name + filter by department (both are sent to the API as query parameters)
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly departmentControl = new FormControl<number | null>(this.initialDepartmentId());
  private readonly searchValue = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  private readonly departmentValue = toSignal(this.departmentControl.valueChanges, {
    initialValue: this.departmentControl.value,
  });

  private readonly reload$ = new BehaviorSubject<void>(undefined);

  constructor() {
    // Departments for the filter dropdown
    this.departmentService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (departments) => this.departments.set(departments),
        error: (err: unknown) => this.notifications.error(errorMessage(err)),
      });

    // Re-query the API whenever the search text, the department or a manual reload changes
    const search$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      startWith(this.searchControl.value),
      distinctUntilChanged(),
    );
    const department$ = this.departmentControl.valueChanges.pipe(startWith(this.departmentControl.value));

    combineLatest([search$, department$, this.reload$])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(([name, departmentId]) =>
          this.employeeService.getAll({ name, departmentId }).pipe(
            catchError((err: unknown) => {
              this.error.set(errorMessage(err));
              return of<Employee[]>([]);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((employees) => {
        this.employees.set(employees);
        this.loading.set(false);
      });
  }

  protected isFiltering(): boolean {
    return this.searchValue().trim() !== '' || this.departmentValue() !== null;
  }

  protected reload(): void {
    this.reload$.next();
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.departmentControl.setValue(null);
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
          this.reload();
        },
        error: (err: unknown) => this.notifications.error(errorMessage(err)),
      });
  }

  /** Supports links such as /employees?departmentId=3 (used by the Departments page). */
  private initialDepartmentId(): number | null {
    const raw = inject(ActivatedRoute).snapshot.queryParamMap.get('departmentId');
    const id = raw === null ? NaN : Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  }
}
