/**
 * Development environment (used by `ng serve`).
 *
 * The backend launch profiles are:
 *   HTTPS: https://localhost:7080   <- recommended (the backend redirects HTTP to HTTPS)
 *   HTTP : http://localhost:5080
 */
export const environment = {
  production: false,
  /** Base URL of the ASP.NET Core backend (no trailing slash). */
  apiBaseUrl: 'https://localhost:7080',
  /** ISO 4217 currency code used to display salaries. */
  currencyCode: 'INR',
};
