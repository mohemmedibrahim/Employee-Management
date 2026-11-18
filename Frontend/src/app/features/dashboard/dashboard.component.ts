import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { initials } from '../../core/utils/form.utils';
import { Department } from '../../models/department.model';
import { Employee } from '../../models/employee.model';
import { errorMessage } from '../../models/api-error.model';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner.component';
import { IconComponent } from '../../shared/components/icon.component';
import { LoadingComponent } from '../../shared/components/loading.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

/** Number of employees shown in the "Recently Added" table. */
const RECENT_LIMIT = 8;

interface DepartmentRow {
  department: Department;
  /** Bar width (0-100) relative to the largest department. */
  percent: number;
}

@Component({
  selector: 'app-dashboard',
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
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currencyCode = environment.currencyCode;
  protected readonly initials = initials;

  protected readonly employees = signal<Employee[]>([]);
  protected readonly departments = signal<Department[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Search / filter controls for the "Recently Added Employees" table
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly departmentControl = new FormControl<number | null>(null);
  private readonly searchTerm = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  private readonly departmentFilter = toSignal(this.departmentControl.valueChanges, { initialValue: null });

  // ----- Statistics (all derived from the API responses) -----
  protected readonly totalEmployees = computed(() => this.employees().length);
  protected readonly totalDepartments = computed(() => this.departments().length);
  protected readonly totalPayroll = computed(() => this.employees().reduce((sum, e) => sum + e.salary, 0));

  protected readonly largestDepartment = computed<Department | null>(() =>
    this.departments().reduce<Department | null>(
      (largest, d) => (largest === null || d.employeeCount > largest.employeeCount ? d : largest),
      null,
    ),
  );

  protected readonly departmentRows = computed<DepartmentRow[]>(() => {
    const sorted = [...this.departments()].sort(
      (a, b) => b.employeeCount - a.employeeCount || a.name.localeCompare(b.name),
    );
    const max = Math.max(1, ...sorted.map((d) => d.employeeCount));
    return sorted.map((department) => ({ department, percent: (department.employeeCount / max) * 100 }));
  });

  /** Newest employees first (the API assigns increasing IDs), narrowed by the search / filter controls. */
  protected readonly recentEmployees = computed<Employee[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const departmentId = this.departmentFilter();

    return [...this.employees()]
      .filter((e) => (departmentId === null || e.departmentId === departmentId) && e.name.toLowerCase().includes(term))
      .sort((a, b) => b.id - a.id)
      .slice(0, RECENT_LIMIT);
  });

  protected readonly isFiltering = computed(() => this.searchTerm().trim() !== '' || this.departmentFilter() !== null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      employees: this.employeeService.getAll(),
      departments: this.departmentService.getAll(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ employees, departments }) => {
          this.employees.set(employees);
          this.departments.set(departments);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(errorMessage(err));
          this.loading.set(false);
        },
      });
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.departmentControl.setValue(null);
  }
}
