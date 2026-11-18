import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Shows the validation message of a form control once it was touched or edited.
 * Usage: <app-field-error [control]="form.controls.email" label="Email" />
 */
@Component({
  selector: 'app-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message(); as text) {
      <p class="field-error" role="alert">{{ text }}</p>
    }
  `,
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl>();
  readonly label = input.required<string>();
  /** Optional overrides, keyed by Angular error key (e.g. { pattern: 'Enter a valid phone number.' }). */
  readonly messages = input<Record<string, string>>({});

  /** Bumped on every control event so the message is recomputed. */
  private readonly version = signal(0);

  constructor() {
    effect((onCleanup) => {
      const subscription = this.control().events.subscribe(() => this.version.update((v) => v + 1));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected readonly message = computed<string | null>(() => {
    this.version();
    const control = this.control();

    if (!control.errors || !(control.touched || control.dirty)) {
      return null;
    }

    const label = this.label();
    const overrides = this.messages();

    for (const [key, detail] of Object.entries(control.errors) as [string, unknown][]) {
      const override = overrides[key];
      if (override) {
        return override;
      }

      const info = (typeof detail === 'object' && detail !== null ? detail : {}) as Record<string, unknown>;

      switch (key) {
        case 'required':
          return `${label} is required.`;
        case 'minlength':
          return `${label} must be at least ${String(info['requiredLength'])} characters.`;
        case 'maxlength':
          return `${label} cannot be longer than ${String(info['requiredLength'])} characters.`;
        case 'min':
          return `${label} must be at least ${String(info['min'])}.`;
        case 'max':
          return `${label} cannot be more than ${String(info['max'])}.`;
        case 'pattern':
        case 'email':
          return `Enter a valid ${label.toLowerCase()}.`;
        case 'invalidDate':
          return 'Enter a valid date.';
        case 'dateRange':
          return 'Joining date must be between 1900 and one year from today.';
        case 'server':
          return typeof detail === 'string' ? detail : `${label} is invalid.`;
        default:
          return `${label} is invalid.`;
      }
    }

    return null;
  });
}
