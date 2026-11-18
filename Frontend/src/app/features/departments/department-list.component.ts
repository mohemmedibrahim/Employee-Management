import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmService } from '../../core/services/confirm.service';
import { DepartmentService } from '../../core/services/department.service';
import { NotificationService } from '../../core/services/notification.service';
import { errorMessage } from '../../models/api-error.model';
import { Department } from '../../models/department.model';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner.component';
import { IconComponent } from '../../shared/components/icon.component';
import { LoadingComponent } from '../../shared/components/loading.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { DepartmentFormDialogComponent } from './department-form-dialog.component';

interface DialogState {
  /** null = create a new department, otherwise the department being edited */
  department: Department | null;
}

@Component({
  selector: 'app-department-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    PageHeaderComponent,
    LoadingComponent,
    ErrorBannerComponent,
    EmptyStateComponent,
    DepartmentFormDialogComponent,
  ],
  templateUrl: './department-list.component.html',
})
export class DepartmentListComponent {
  private readonly departmentService = inject(DepartmentService);
  private readonly notifications = inject(NotificationService);
  private readonly confirmService = inject(ConfirmService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly departments = signal<Department[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly dialog = signal<DialogState | null>(null);

  constructor() {
    this.load();

    // "/departments?new=1" (used by the dashboard's "Add Department" button) opens the dialog directly.
    if (this.route.snapshot.queryParamMap.has('new')) {
      this.openDialog(null);
      void this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.departmentService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (departments) => {
          this.departments.set(departments);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(errorMessage(err));
          this.loading.set(false);
        },
      });
  }

  protected openDialog(department: Department | null): void {
    this.dialog.set({ department });
  }

  protected closeDialog(): void {
    this.dialog.set(null);
  }

  protected onSaved(department: Department): void {
    const wasEditing = this.dialog()?.department != null;
    this.closeDialog();
    this.notifications.success(
      wasEditing ? `Department "${department.name}" was updated.` : `Department "${department.name}" was created.`,
    );
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
          this.load();
        },
        error: (err: unknown) => this.notifications.error(errorMessage(err)),
      });
  }
}
