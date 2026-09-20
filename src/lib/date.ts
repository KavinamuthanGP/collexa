/**
 * Date helpers for Collexa.
 *
 * Storage / interoperability format (Firestore, sorting, filtering, calendar
 * matching) is always the ISO calendar date `YYYY-MM-DD`.
 * User-facing format is always `DD/MM/YYYY`.
 *
 * All conversions use local calendar components (never UTC parsing) so a date
 * never shifts by a day for users outside UTC. `new Date('2026-03-15')` parses
 * as UTC midnight and would render as 14/03/2026 in negative-offset zones,
 * which is why parsing goes through the explicit regex + local constructor.
 */

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Format a local `Date` as the storage format `YYYY-MM-DD`. */
export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a storage-format date (`YYYY-MM-DD`) into a `Date` at local midnight.
 * Returns `undefined` for missing or malformed/invalid values.
 */
export const parseIsoDate = (value?: string | null): Date | undefined => {
  if (!value) return undefined;

  const match = ISO_DATE_PATTERN.exec(value.trim());
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  // Reject rolled-over values such as 2026-02-31 (which JS turns into 03/03).
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
};

/** True when `value` is a valid storage-format date (`YYYY-MM-DD`). */
export const isValidIsoDate = (value?: string | null): boolean =>
  parseIsoDate(value) !== undefined;

/**
 * Format a stored date as user-facing `DD/MM/YYYY`.
 *
 * Values that are not valid ISO dates (e.g. legacy/seed data written in another
 * format) are returned unchanged so nothing is ever hidden from the user.
 */
export const formatDate = (value?: string | null): string => {
  if (!value) return '';

  const date = parseIsoDate(value);
  if (!date) return value.trim();

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};
