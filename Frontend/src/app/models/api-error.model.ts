/**
 * A normalised error. The backend returns RFC 7807 "problem details"
 * (400 validation, 404, 409, 500). The HTTP interceptor converts every failed
 * request into this shape so components never deal with raw HttpErrorResponse.
 */
export interface ApiError {
  status: number;
  title: string;
  /** Human-readable message that is safe to show to the user. */
  message: string;
  /** Field name (as sent by the backend, e.g. "Email") -> validation messages. */
  fieldErrors: Record<string, string[]>;
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    'fieldErrors' in value &&
    'status' in value
  );
}

/** Returns a displayable message for anything that was thrown. */
export function errorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}
