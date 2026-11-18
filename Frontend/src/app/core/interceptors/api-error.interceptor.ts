import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiError } from '../../models/api-error.model';

/** Shape of the backend's ProblemDetails / ValidationProblemDetails JSON. */
interface ProblemBody {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

function toApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return {
      status: -1,
      title: 'Unexpected error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      fieldErrors: {},
    };
  }

  // status 0 = the browser could not reach the server (offline, wrong URL, CORS, bad certificate)
  if (error.status === 0) {
    return {
      status: 0,
      title: 'Network error',
      message:
        `Cannot reach the backend at ${environment.apiBaseUrl}. ` +
        'Make sure the API is running, the URL in the environment file is correct, ' +
        'and CORS allows http://localhost:4200.',
      fieldErrors: {},
    };
  }

  const body: ProblemBody | null =
    typeof error.error === 'object' && error.error !== null ? (error.error as ProblemBody) : null;
  const fieldErrors = body?.errors ?? {};
  const validationText = Object.values(fieldErrors).flat().join(' ');

  const message =
    body?.detail ||
    validationText ||
    body?.title ||
    (error.status === 404 ? 'The requested resource was not found.' : `Request failed (HTTP ${error.status}).`);

  return {
    status: error.status,
    title: body?.title ?? error.statusText,
    message,
    fieldErrors,
  };
}

/** Converts every failed HTTP call into an {@link ApiError}. */
export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(catchError((error: unknown) => throwError(() => toApiError(error))));
