/**
 * Helpers for local calendar dates (no time and no time zone). ISO format: YYYY-MM-DD; display
 * format DD/MM/YYYY (UAE). Ported from dubai-health-ui (packages/components/src/date/date-utils.ts).
 */
export interface DahcCalendarDate {
  readonly year: number;
  /** 0 = January. */
  readonly month: number;
  readonly day: number;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export function dahcToIsoDate({ year, month, day }: DahcCalendarDate): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function dahcFromIsoDate(value: string): DahcCalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const date = { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };

  return dahcIsValidDate(date) ? date : null;
}

export function dahcIsValidDate({ year, month, day }: DahcCalendarDate): boolean {
  const date = new Date(year, month, day);

  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

/** Parses DD/MM/YYYY; also accepts - and . as separators. */
export function dahcParseDisplayDate(text: string): DahcCalendarDate | null {
  const match = /^\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\s*$/.exec(text);

  if (!match) {
    return null;
  }

  const date = { year: Number(match[3]), month: Number(match[2]) - 1, day: Number(match[1]) };

  return dahcIsValidDate(date) ? date : null;
}

export function dahcFormatDisplayDate({ year, month, day }: DahcCalendarDate): string {
  return `${pad(day)}/${pad(month + 1)}/${year}`;
}

export function dahcAddDays({ year, month, day }: DahcCalendarDate, days: number): DahcCalendarDate {
  const date = new Date(year, month, day + days);

  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
}

/** Adds months, clamping the day to the last day of the target month. */
export function dahcAddMonths({ year, month, day }: DahcCalendarDate, months: number): DahcCalendarDate {
  const target = new Date(year, month + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();

  return { year: target.getFullYear(), month: target.getMonth(), day: Math.min(day, lastDay) };
}

export function dahcCompareDates(first: DahcCalendarDate, second: DahcCalendarDate): number {
  return dahcToIsoDate(first).localeCompare(dahcToIsoDate(second));
}

export function dahcToday(): DahcCalendarDate {
  const now = new Date();

  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

/** Weekday of a date relative to the first day of the week (0 = first column). */
export function dahcWeekdayIndex(date: DahcCalendarDate, firstDayOfWeek: number): number {
  return (new Date(date.year, date.month, date.day).getDay() - firstDayOfWeek + 7) % 7;
}

/** The 6 x 7 grid of dates shown for a month, starting on firstDayOfWeek (0 = Sunday, 1 = Monday). */
export function dahcMonthGrid(year: number, month: number, firstDayOfWeek: number): readonly DahcCalendarDate[] {
  const offset = dahcWeekdayIndex({ year, month, day: 1 }, firstDayOfWeek);

  return Array.from({ length: 42 }, (_, index) => dahcAddDays({ year, month, day: 1 }, index - offset));
}
