import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from '../../core/services/confirm.service';
import { IconComponent } from './icon.component';

/** Global confirmation dialog driven by ConfirmService (used for delete confirmations). */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: { '(document:keydown.escape)': 'confirm.answer(false)' },
  template: `
    @if (confirm.options(); as options) {
      <div class="modal-backdrop" (click)="confirm.answer(false)">
        <div
          class="modal modal-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
          (click)="$event.stopPropagation()"
        >
          <div class="confirm-body">
            <span class="confirm-icon" [class.confirm-icon-danger]="options.danger">
              <app-icon [name]="options.danger ? 'trash' : 'info'" [size]="24" />
            </span>
            <h2 id="confirm-title" class="modal-title">{{ options.title }}</h2>
            <p id="confirm-message" class="muted">{{ options.message }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="confirm.answer(false)">
              {{ options.cancelText ?? 'Cancel' }}
            </button>
            <button
              type="button"
              class="btn"
              [class.btn-danger]="options.danger"
              [class.btn-primary]="!options.danger"
              (click)="confirm.answer(true)"
            >
              {{ options.confirmText ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
}
