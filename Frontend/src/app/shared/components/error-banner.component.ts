import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

/** Inline error message (for failed loads) with an optional Retry button. */
@Component({
  selector: 'app-error-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="alert alert-error" role="alert">
      <app-icon name="alert" [size]="20" />
      <span class="alert-text">{{ message() }}</span>
      @if (retryable()) {
        <button type="button" class="btn btn-secondary btn-sm" (click)="retry.emit()">
          <app-icon name="refresh" [size]="14" /> Retry
        </button>
      }
    </div>
  `,
})
export class ErrorBannerComponent {
  readonly message = input.required<string>();
  readonly retryable = input(true);
  readonly retry = output<void>();
}
