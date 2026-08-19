/**
 * Formats a Date object as 'YYYY-MM-DD' using local time zone.
 * Prevents UTC date shift bugs caused by Date.prototype.toISOString().
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
