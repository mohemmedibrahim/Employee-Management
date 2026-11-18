import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Spinner with a message, shown while data is loading from the API. */
@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <span>{{ message() }}</span>
    </div>
  `,
})
export class LoadingComponent {
  readonly message = input('Loading…');
}
