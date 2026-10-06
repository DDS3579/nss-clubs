/**
 * Date helpers for events.
 *
 * Why this exists: `new Date(x).toLocaleDateString()` uses the clock of
 * whatever machine runs it. Vercel's servers run on UTC, visitors' phones run
 * on their own time zone, so an evening event could show as the wrong DAY and
 * the server/browser output could differ (React "hydration mismatch").
 * Everything here formats in ONE fixed time zone instead.
 */

/**
 * The time zone your events happen in (IANA name).
 * ⚠ Assumed from your schema's "2082/83" academic-year example. Change this one
 * line if your events run on a different clock.
 */
export const SITE_TIME_ZONE = "Asia/Kathmandu";

const LOCALE = "en-US";

function parse(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "YYYY-MM-DD" of the given moment, as seen in SITE_TIME_ZONE. */
export function toDateKey(input: string | Date): string {
  const d = parse(input);
  if (!d) return "";
  const parts = new Intl.DateTimeFormat(LOCALE, {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * True until the end of the event's day (site time zone).
 * An event today at 10:00 still counts as "upcoming" at 4 pm.
 */
export function isUpcoming(
  iso: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const d = parse(iso);
  if (!d) return false;
  return toDateKey(d) >= toDateKey(now);
}

/** "Sunday, March 15, 2026" (long) or "Mar 15, 2026" (short). "" if invalid. */
export function formatEventDate(
  iso: string | null | undefined,
  style: "long" | "short" = "long",
): string {
  const d = parse(iso);
  if (!d) return "";
  return new Intl.DateTimeFormat(
    LOCALE,
    style === "long"
      ? { timeZone: SITE_TIME_ZONE, weekday: "long", year: "numeric", month: "long", day: "numeric" }
      : { timeZone: SITE_TIME_ZONE, year: "numeric", month: "short", day: "numeric" },
  ).format(d);
}

/** "7:30 PM". "" if invalid. */
export function formatEventTime(iso: string | null | undefined): string {
  const d = parse(iso);
  if (!d) return "";
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: SITE_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/** For calendar-style badges: { month: "MAR", day: "15" }. */
export function getDateBadge(
  iso: string | null | undefined,
): { month: string; day: string } | null {
  const d = parse(iso);
  if (!d) return null;
  const month = new Intl.DateTimeFormat(LOCALE, { timeZone: SITE_TIME_ZONE, month: "short" })
    .format(d)
    .toUpperCase();
  const day = new Intl.DateTimeFormat(LOCALE, { timeZone: SITE_TIME_ZONE, day: "numeric" }).format(d);
  return { month, day };
}