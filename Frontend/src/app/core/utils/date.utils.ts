/** Date helpers. The backend uses DateTime without a time zone, e.g. "2026-01-15T00:00:00". */

/** "2026-01-15" (from <input type="date">) -> "2026-01-15T00:00:00" (for the API). */
export function toApiDateTime(dateOnly: string): string {
  return `${dateOnly}T00:00:00`;
}

/** "2026-01-15T00:00:00" (from the API) -> "2026-01-15" (for <input type="date">). */
export function toDateInput(apiDateTime: string): string {
  return apiDateTime.slice(0, 10);
}

/** Today's date as "yyyy-MM-dd" in the user's local time zone. */
export function todayAsDateInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
