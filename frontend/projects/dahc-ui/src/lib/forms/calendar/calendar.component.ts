import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  LOCALE_ID,
  afterNextRender,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';

import {
  DahcCalendarDate,
  dahcAddDays,
  dahcAddMonths,
  dahcCompareDates,
  dahcFromIsoDate,
  dahcMonthGrid,
  dahcToIsoDate,
  dahcToday,
  dahcWeekdayIndex,
} from '../../core/date/date-utils';
import { DahcIconComponent } from '../../core/icon/icon.component';

interface CalendarDay {
  readonly date: DahcCalendarDate;
  readonly iso: string;
  readonly label: string;
  readonly number: string;
  readonly outside: boolean;
  readonly selected: boolean;
  readonly today: boolean;
  readonly focused: boolean;
  readonly disabled: boolean;
}

/**
 * Month calendar for picking a date; used by dahc-date-picker and on its own.
 * Keyboard (WAI-ARIA date picker grid): arrows move by day and week, Page Up / Page Down by month
 * (with Shift by year), Home / End to the start / end of the week, Enter or Space selects.
 * DERIVED design: the DH Datepicker page (50:7957) is empty. DH lists Secondary Blue 100 for
 * "Calendar"; the selected day uses navy and today a navy ring. Pending UX sign-off.
 * Ported from dubai-health-ui (packages/components/src/date/dh-calendar.ts).
 */
@Component({
  selector: 'dahc-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class DahcCalendarComponent {
  /** Selected date, ISO YYYY-MM-DD; empty when none. */
  readonly value = model<string>('');
  /** Earliest selectable date, ISO. */
  readonly min = input<string>('');
  /** Latest selectable date, ISO. */
  readonly max = input<string>('');
  /** BCP 47 locale for month and weekday names; defaults to the app locale. */
  readonly locale = input<string>(inject(LOCALE_ID));
  /** First day of the week: 0 Sunday, 1 Monday (UAE default). */
  readonly firstDayOfWeek = input<number>(1);
  /** Disables individual dates, for example public holidays. */
  readonly isDateDisabled = input<(iso: string) => boolean>(() => false);
  readonly previousMonthLabel = input<string>($localize`:@@dahcUi.calendar.previousMonth:Previous month`);
  readonly nextMonthLabel = input<string>($localize`:@@dahcUi.calendar.nextMonth:Next month`);
  /** Emits the ISO date the user chose. */
  readonly dateSelected = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** The day with keyboard focus; follows the selected value. */
  protected readonly focused = linkedSignal<DahcCalendarDate>(() => dahcFromIsoDate(this.value()) ?? dahcToday());

  protected readonly monthLabel = computed<string>(() =>
    new Intl.DateTimeFormat(this.locale(), { month: 'long', year: 'numeric' }).format(
      new Date(this.focused().year, this.focused().month, 1),
    ),
  );

  protected readonly weekdays = computed(() => {
    const short = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    const long = new Intl.DateTimeFormat(this.locale(), { weekday: 'long' });

    // 7 January 2024 was a Sunday.
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2024, 0, 7 + ((this.firstDayOfWeek() + index) % 7));

      return { short: short.format(date), long: long.format(date) };
    });
  });

  protected readonly weeks = computed<readonly (readonly CalendarDay[])[]>(() => {
    const { year, month } = this.focused();
    const selected = dahcFromIsoDate(this.value());
    const now = dahcToday();
    const dayLabel = new Intl.DateTimeFormat(this.locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const numberFormat = new Intl.NumberFormat(this.locale());
    const days = dahcMonthGrid(year, month, this.firstDayOfWeek()).map<CalendarDay>(date => ({
      date,
      iso: dahcToIsoDate(date),
      label: dayLabel.format(new Date(date.year, date.month, date.day)),
      number: numberFormat.format(date.day),
      outside: date.month !== month,
      selected: selected !== null && dahcCompareDates(date, selected) === 0,
      today: dahcCompareDates(date, now) === 0,
      focused: dahcCompareDates(date, this.focused()) === 0,
      disabled: this.isDisabled(date),
    }));

    return Array.from({ length: 6 }, (_, row) => days.slice(row * 7, row * 7 + 7));
  });

  /** Moves keyboard focus to the focused day, for example when a popup opens. */
  focusDay(): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('.dahc-calendar__day[tabindex="0"]')?.focus(), {
      injector: this.injector,
    });
  }


  protected showMonth(offset: number): void {
    this.focused.update(date => dahcAddMonths(date, offset));
  }

  protected select(day: CalendarDay): void {
    if (day.disabled) {
      return;
    }

    this.focused.set(day.date);
    this.value.set(day.iso);
    this.dateSelected.emit(day.iso);
  }

  /** Grid keyboard navigation; only while a day button has focus. */
  protected onKeydown(event: KeyboardEvent): void {
    if (!(event.target instanceof HTMLElement) || !event.target.classList.contains('dahc-calendar__day')) {
      return;
    }

    const date = this.focused();
    const isRtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const weekday = dahcWeekdayIndex(date, this.firstDayOfWeek());
    const moves: Record<string, () => DahcCalendarDate> = {
      ArrowLeft: () => dahcAddDays(date, isRtl ? 1 : -1),
      ArrowRight: () => dahcAddDays(date, isRtl ? -1 : 1),
      ArrowUp: () => dahcAddDays(date, -7),
      ArrowDown: () => dahcAddDays(date, 7),
      PageUp: () => dahcAddMonths(date, event.shiftKey ? -12 : -1),
      PageDown: () => dahcAddMonths(date, event.shiftKey ? 12 : 1),
      Home: () => dahcAddDays(date, -weekday),
      End: () => dahcAddDays(date, 6 - weekday),
    };

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const day = this.weeks().flat().find(candidate => candidate.focused);

      if (day) {
        this.select(day);
      }

      return;
    }

    const move = moves[event.key];

    if (!move) {
      return;
    }

    event.preventDefault();
    this.focused.set(move());
    this.focusDay();
  }

  private isDisabled(date: DahcCalendarDate): boolean {
    const min = dahcFromIsoDate(this.min());
    const max = dahcFromIsoDate(this.max());

    if ((min && dahcCompareDates(date, min) < 0) || (max && dahcCompareDates(date, max) > 0)) {
      return true;
    }

    return this.isDateDisabled()(dahcToIsoDate(date));
  }
}
