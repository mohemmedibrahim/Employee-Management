import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

/** Shown for any address that does not match a route. */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyStateComponent],
  template: `
    <section class="card">
      <app-empty-state
        icon="alert"
        title="Page not found"
        message="The page you are looking for does not exist or has been moved."
      >
        <a class="btn btn-primary" routerLink="/dashboard">Go to Dashboard</a>
      </app-empty-state>
    </section>
  `,
})
export class NotFoundComponent {}
