import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { todayAsDateInput, toApiDateTime, toDateInput } from '../../core/utils/date.utils';
import {
  EMAIL_PATTERN,
  PHONE_PATTERN,
  SALARY_MAX,
  SALARY_PATTERN,
  applyServerErrors,
  joiningDateValidator,
} from '../../core/utils/form.utils';
import { errorMessage, isApiError } from '../../models/api-error.model';
import { Department } from '../../models/department.model';
import { EmployeeRequest } from '../../models/employee.model';
import { ErrorBannerComponent } from '../../shared/components/error-banner.component';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { IconComponent } from '../../shared/components/icon.component';
import { LoadingComponent } from '../../shared/components/loading.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

/** Add / edit employee page. Edit mode is used when the route contains an :id. */
@Component({
  selector: 'app-employee-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IconComponent,
    PageHeaderComponent,
    LoadingComponent,
    ErrorBannerComponent,
    FieldErrorComponent,
  ],
  templateUrl: './employee-form.component.html',
})
export class EmployeeFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly idParam = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly employeeId = this.idParam === null ? null : Number(this.idParam);

  protected readonly isEdit = this.employeeId !== null;

  protected readonly departments = signal<Department[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);

  // Validation rules mirror the backend CreateEmployeeDto
  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    email: this.fb.control('', [Validators.required, Validators.maxLength(150), Validators.pattern(EMAIL_PATTERN)]),
    phone: this.fb.control('', [Validators.required, Validators.maxLength(20), Validators.pattern(PHONE_PATTERN)]),
    salary: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(SALARY_MAX),
      Validators.pattern(SALARY_PATTERN),
    ]),
    joiningDate: this.fb.control(todayAsDateInput(), [Validators.required, joiningDateValidator]),
    departmentId: this.fb.control<number | null>(null, [Validators.required]),
  });

  protected readonly emailMessages = { pattern: 'Enter a valid email address, e.g. name@company.com.' };
  protected readonly phoneMessages = {
    pattern: 'Enter a valid phone number (7–20 characters: digits, spaces, + ( ) . -).',
  };
  protected readonly salaryMessages = { pattern: 'Salary can have at most 2 decimal places.' };

  constructor() {
    this.load();
  }

  protected load(): void {
    if (this.employeeId !== null && (!Number.isInteger(this.employeeId) || this.employeeId <= 0)) {
      this.loadError.set('The employee id in the address is not valid.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);

    // The department dropdown is filled from the API; in edit mode the employee is loaded as well.
    forkJoin({
      departments: this.departmentService.getAll(),
      employee: this.employeeId === null ? of(null) : this.employeeService.getById(this.employeeId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ departments, employee }) => {
          this.departments.set(departments);

          if (employee) {
            this.form.patchValue({
              name: employee.name,
              email: employee.email,
              phone: employee.phone,
              salary: employee.salary,
              joiningDate: toDateInput(employee.joiningDate),
              departmentId: employee.departmentId,
            });
          }

          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loadError.set(errorMessage(err));
          this.loading.set(false);
        },
      });
  }

  protected submit(): void {
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.salary === null || value.departmentId === null) {
      return; // already reported by the required validators
    }

    const payload: EmployeeRequest = {
      name: value.name.trim(),
      email: value.email.trim(),
      phone: value.phone.trim(),
      salary: value.salary,
      joiningDate: toApiDateTime(value.joiningDate),
      departmentId: value.departmentId,
    };

    const request$ =
      this.employeeId === null
        ? this.employeeService.create(payload)
        : this.employeeService.update(this.employeeId, payload);

    this.saving.set(true);
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (employee) => {
        this.notifications.success(
          this.isEdit ? `${employee.name} was updated.` : `${employee.name} was added to ${employee.departmentName}.`,
        );
        void this.router.navigate(['/employees']);
      },
      error: (err: unknown) => {
        this.saving.set(false);

        if (isApiError(err)) {
          const handledByField = applyServerErrors(this.form, err);

          // 409 "An employee with email ... already exists" -> highlight the email field too
          if (err.status === 409 && /email/i.test(err.message)) {
            this.form.controls.email.setErrors({ server: err.message });
            this.form.controls.email.markAsTouched();
          }

          this.submitError.set(handledByField ? 'Please fix the highlighted fields.' : err.message);
        } else {
          this.submitError.set(errorMessage(err));
        }
      },
    });
  }
}
