/**
 * Production environment (used by `ng build`).
 * Change apiBaseUrl to the address where your ASP.NET Core backend is deployed.
 */
export const environment = {
  production: true,
  /** Base URL of the ASP.NET Core backend (no trailing slash). */
  apiBaseUrl: 'https://localhost:7080',
  /** ISO 4217 currency code used to display salaries. */
  currencyCode: 'INR',
};
