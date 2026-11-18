import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent, IconName } from './icon.component';

/** Friendly message shown when a list has no data. Action buttons can be projected inside. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="empty-state">
      <span class="empty-icon"><app-icon [name]="icon()" [size]="28" /></span>
      <h3>{{ title() }}</h3>
      <p class="muted">{{ message() }}</p>
      <div class="empty-actions"><ng-content /></div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input<IconName>('inbox');
  readonly title = input.required<string>();
  readonly message = input('');
}
