import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from './icon.component';

/** Renders the success / error notifications raised through NotificationService. */
@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of notifications.toasts(); track toast.id) {
        <div class="toast" [class]="'toast toast-' + toast.kind" role="status">
          <app-icon [name]="toast.kind === 'success' ? 'check' : toast.kind === 'error' ? 'alert' : 'info'" [size]="20" />
          <span class="toast-message">{{ toast.message }}</span>
          <button type="button" class="toast-close" aria-label="Dismiss notification" (click)="notifications.dismiss(toast.id)">
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly notifications = inject(NotificationService);
}
