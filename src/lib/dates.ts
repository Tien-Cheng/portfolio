/**
 * Formatting for RenderCV-style dates.
 *
 * An entry carries either a `date` (a single date or free text such as "Expected 2029") or a
 * `start_date` / `end_date` pair. Dates are `YYYY-MM-DD`, `YYYY-MM` or `YYYY`; `end_date` may be
 * "present". As in RenderCV, a start date with no end date means the entry is ongoing.
 */

export interface DatedEntry {
  start_date?: string | undefined;
  end_date?: string | undefined;
  date?: string | undefined;
}

interface PartialDate {
  year: number;
  /** 1–12, or undefined when only the year is known. */
  month: number | undefined;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const PRESENT = "present";
const EN_DASH = "–";

/** Parses `YYYY`, `YYYY-MM` or `YYYY-MM-DD`; anything else returns undefined. */
export function parseDate(value: string): PartialDate | undefined {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value.trim());
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = match[2] === undefined ? undefined : Number(match[2]);
  if (month !== undefined && (month < 1 || month > 12)) return undefined;
  return { year, month };
}

const isPresent = (value: string | undefined) => value?.trim().toLowerCase() === PRESENT;

const isBlank = (value: string | undefined) => value === undefined || value.trim() === "";

/**
 * True for an entry that is still running: a start date with no end date, or an end date of
 * "present" (any case). The CV, the index and the JSON-LD all use this one rule.
 */
export function isOngoing(entry: DatedEntry): boolean {
  if (isPresent(entry.end_date)) return true;
  return !isBlank(entry.start_date) && isBlank(entry.end_date);
}

const formatOne = (d: PartialDate) =>
  d.month === undefined ? String(d.year) : `${MONTHS[d.month - 1]} ${d.year}`;

type Resolved =
  | { kind: "text"; text: string }
  | { kind: "single"; date: PartialDate }
  | { kind: "range"; start: PartialDate; end: PartialDate | "present" }
  | { kind: "none" };

function resolve(entry: DatedEntry): Resolved {
  if (entry.date !== undefined && entry.date.trim() !== "") {
    const single = parseDate(entry.date);
    return single ? { kind: "single", date: single } : { kind: "text", text: entry.date.trim() };
  }
  const start = entry.start_date === undefined ? undefined : parseDate(entry.start_date);
  const endRaw = entry.end_date;
  const end = isPresent(endRaw) ? PRESENT : endRaw === undefined ? undefined : parseDate(endRaw);

  if (start) return { kind: "range", start, end: end ?? PRESENT };
  if (end && end !== PRESENT) return { kind: "single", date: end };
  return { kind: "none" };
}

/**
 * Long form for the CV page: "Jul 2026 – present", "Aug – Dec 2025", "Sep 2022 – Feb 2023",
 * "Expected 2029", or a single "Mar 2023" for end-only entries.
 *
 * A range within one year drops the start's year only when both ends have a month
 * ("Aug – Dec 2025"). With mixed precision each end keeps its own ("2025 – Aug 2025",
 * "Mar 2025 – 2025"), so no month is ever lost.
 */
export function formatRange(entry: DatedEntry): string {
  const r = resolve(entry);
  switch (r.kind) {
    case "none":
      return "";
    case "text":
      return r.text;
    case "single":
      return formatOne(r.date);
    case "range": {
      const { start, end } = r;
      if (end === PRESENT) return `${formatOne(start)} ${EN_DASH} present`;
      if (start.year === end.year) {
        if (start.month === end.month) return formatOne(end);
        if (start.month !== undefined && end.month !== undefined) {
          return `${MONTHS[start.month - 1]} ${EN_DASH} ${formatOne(end)}`;
        }
      }
      return `${formatOne(start)} ${EN_DASH} ${formatOne(end)}`;
    }
  }
}

/**
 * Compact year span for the index, with a tight en dash: "2026–now", "2025", "2024–25", or a
 * bare end year. `startYear` supplies a start the entry itself lacks (an end-only or "Expected
 * 2029" education entry), so those read "2020–23" and "2025–29"; the entry's own start wins.
 */
export function formatSpan(entry: DatedEntry, startYear?: number): string {
  const r = resolve(entry);
  const span = (from: number, to: number) => {
    if (from === to) return String(to);
    const sameCentury = Math.floor(from / 100) === Math.floor(to / 100);
    return `${from}${EN_DASH}${sameCentury ? String(to).slice(-2) : to}`;
  };
  switch (r.kind) {
    case "none":
      return "";
    case "text": {
      const year = /\b(\d{4})\b/.exec(r.text)?.[1];
      if (!year) return r.text;
      if (startYear !== undefined) return span(startYear, Number(year));
      return /expected/i.test(r.text) ? `Exp. ${year}` : year;
    }
    case "single":
      return startYear === undefined ? String(r.date.year) : span(startYear, r.date.year);
    case "range": {
      const { start, end } = r;
      if (end === PRESENT) return `${start.year}${EN_DASH}now`;
      return span(start.year, end.year);
    }
  }
}
