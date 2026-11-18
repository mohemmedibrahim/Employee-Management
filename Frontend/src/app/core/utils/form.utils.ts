import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ApiError } from '../../models/api-error.model';

/**
 * Validators that match the rules enforced by the backend DTOs
 * (CreateEmployeeDto / CreateDepartmentDto).
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^\+?[0-9()\s.-]{7,20}$/;
export const SALARY_PATTERN = /^\d+(\.\d{1,2})?$/;

export const SALARY_MAX = 999_999_999;

/** Joining date must be a real date between 1900-01-01 and one year from today. */
export function joiningDateValidator(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;
  if (typeof value !== 'string' || value === '') {
    return null; // the "required" validator reports an empty value
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { invalidDate: true };
  }

  const earliest = new Date('1900-01-01T00:00:00');
  const latest = new Date();
  latest.setFullYear(latest.getFullYear() + 1);

  return date < earliest || date > latest ? { dateRange: true } : null;
}

/**
 * Copies backend validation messages (e.g. { "Email": ["..."] }) onto the matching
 * form controls. Returns true when at least one message was applied.
 */
export function applyServerErrors(form: FormGroup, error: ApiError): boolean {
  let applied = false;

  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const controlName = field.charAt(0).toLowerCase() + field.slice(1);
    const control = form.get(controlName);
    const first = messages[0];

    if (control && first) {
      control.setErrors({ server: first });
      control.markAsTouched();
      applied = true;
    }
  }

  return applied;
}

/** "John Smith" -> "JS" (used for avatar circles). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}
