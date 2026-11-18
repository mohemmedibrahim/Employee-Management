import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartmentService } from '../../core/services/department.service';
import { applyServerErrors } from '../../core/utils/form.utils';
import { errorMessage, isApiError } from '../../models/api-error.model';
import { Department, DepartmentRequest } from '../../models/department.model';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { IconComponent } from '../../shared/components/icon.component';

/**
 * Modal dialog used to add a new department or edit an existing one.
 * Pass `department` to edit, leave it null to create.
 */
@Component({
  selector: 'app-department-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FieldErrorComponent, IconComponent],
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="modal-backdrop" (click)="closed.emit()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="department-dialog-title"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h2 id="department-dialog-title" class="modal-title">
            {{ department() ? 'Edit Department' : 'Add Department' }}
          </h2>
          <button type="button" class="icon-btn" aria-label="Close dialog" (click)="closed.emit()">
            <app-icon name="close" [size]="20" />
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="modal-body">
            @if (submitError(); as message) {
              <div class="alert alert-error" role="alert">
                <app-icon name="alert" [size]="18" />
                <span class="alert-text">{{ message }}</span>
              </div>
            }

            <div class="form-group">
              <label for="dept-name" class="form-label">Name <span class="required">*</span></label>
              <input
                id="dept-name"
                type="text"
                class="form-control"
                formControlName="name"
                maxlength="100"
                placeholder="e.g. Engineering"
                [class.is-invalid]="form.controls.name.invalid && form.controls.name.touched"
              />
              <app-field-error [control]="form.controls.name" label="Department name" />
            </div>

            <div class="form-group">
              <label for="dept-description" class="form-label">Description</label>
              <textarea
                id="dept-description"
                class="form-control"
                rows="4"
                formControlName="description"
                maxlength="250"
                placeholder="What does this department do? (optional)"
                [class.is-invalid]="form.controls.description.invalid && form.controls.description.touched"
              ></textarea>
              <div class="form-hint">{{ form.controls.description.value.length }}/250</div>
              <app-field-error [control]="form.controls.description" label="Description" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closed.emit()" [disabled]="saving()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) {
                <span class="spinner spinner-sm" aria-hidden="true"></span> Saving…
              } @else {
                {{ department() ? 'Save Changes' : 'Create Department' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class DepartmentFormDialogComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly destroyRef = inject(DestroyRef);

  /** The department being edited, or null when creating a new one. */
  readonly department = input<Department | null>(null);

  /** Emits the saved department (created or updated) returned by the API. */
  readonly saved = output<Department>();
  readonly closed = output<void>();

  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);

  // Rules match the backend: Name required, 2-100 chars; Description optional, max 250 chars
  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    description: this.fb.control('', [Validators.maxLength(250)]),
  });

  ngOnInit(): void {
    const existing = this.department();
    if (existing) {
      this.form.patchValue({ name: existing.name, description: existing.description ?? '' });
    }
  }

  protected submit(): void {
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: DepartmentRequest = {
      name: value.name.trim(),
      description: value.description.trim() === '' ? null : value.description.trim(),
    };

    const existing = this.department();
    const request$ = existing
      ? this.departmentService.update(existing.id, payload)
      : this.departmentService.create(payload);

    this.saving.set(true);
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (department) => {
        this.saving.set(false);
        this.saved.emit(department);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        const handledByField = isApiError(err) && applyServerErrors(this.form, err);
        // Show a general message too (e.g. 409 "A department named ... already exists")
        this.submitError.set(handledByField ? 'Please fix the highlighted fields.' : errorMessage(err));
      },
    });
  }
}
