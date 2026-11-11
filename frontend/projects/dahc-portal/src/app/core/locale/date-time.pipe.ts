import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

export type DahcDateTimeStyle = 'date' | 'dateTime';

/**
 * Formats an ISO 8601 instant in the active locale and the given IANA time zone with
 * Intl.DateTimeFormat. Used instead of Angular's DatePipe for every zoned time.
 */
@Pipe({ name: 'dahcDateTime' })
export class DahcDateTimePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: string | null | undefined, timeZoneId: string, style: DahcDateTimeStyle = 'date'): string {
    return formatDahcDateTime(value, this.locale, timeZoneId, style);
  }
}

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Shared by the pipe and by components that build display values in code. Empty or invalid input gives ''. */
export function formatDahcDateTime(
  value: string | null | undefined,
  locale: string,
  timeZoneId: string,
  style: DahcDateTimeStyle = 'date',
): string {
  if (!value) {
    return '';
  }

  const instant = new Date(value);

  if (Number.isNaN(instant.getTime())) {
    return '';
  }

  const key = `${locale}|${timeZoneId}|${style}`;
  let formatter = formatters.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      timeZone: timeZoneId,
      dateStyle: 'medium',
      ...(style === 'dateTime' ? { timeStyle: 'short' } : {}),
    });
    formatters.set(key, formatter);
  }

  return formatter.format(instant);
}
