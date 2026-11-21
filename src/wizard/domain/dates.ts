// Dates are kept as "YYYY-MM-DD" strings (like <input type="date">) and compared in UTC,
// so server and browser agree regardless of their time zone.

const DAY = 24 * 60 * 60 * 1000;

export function parseDate(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  const time = Date.parse(`${value}T00:00:00Z`);
  // Rejects dates like "2026-02-31", which Date would roll over into March.
  return Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value
    ? undefined
    : time;
}

export function toDateString(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

export function today(now = new Date()) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function addDays(time: number, days: number) {
  return time + days * DAY;
}

export function daysBetween(from: number, to: number) {
  return Math.round((to - from) / DAY);
}

export function addMonths(time: number, months: number) {
  const date = new Date(time);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.getTime();
}

/** Full years between a birth date and a day, e.g. the day of departure. */
export function ageOn(birth: number, day: number) {
  const b = new Date(birth);
  const d = new Date(day);
  let age = d.getUTCFullYear() - b.getUTCFullYear();
  if (
    d.getUTCMonth() < b.getUTCMonth() ||
    (d.getUTCMonth() === b.getUTCMonth() && d.getUTCDate() < b.getUTCDate())
  ) {
    age--;
  }
  return age;
}

/** E.g. "2026-11-21" → "Sat, 21 Nov 2026". */
export function formatDate(value: unknown) {
  const time = parseDate(value);
  return time === undefined
    ? ""
    : new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(time);
}
