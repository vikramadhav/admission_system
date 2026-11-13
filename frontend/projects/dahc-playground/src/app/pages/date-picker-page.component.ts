import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcCalendarComponent, DahcDatePickerComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-date-picker-page',
  templateUrl: './date-picker-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcCalendarComponent,
    DahcDatePickerComponent,
    DocExampleComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class DatePickerPageComponent {
  protected readonly sourceFiles = [
    'forms/date-picker/date-picker.component.ts',
    'forms/date-picker/date-picker.component.html',
    'forms/calendar/calendar.component.ts',
    'forms/calendar/calendar.component.html',
    'forms/calendar/calendar.component.css',
    'core/date/date-utils.ts',
    'core/overlay/position.ts',
  ];

  protected readonly label = signal<string>('Date of birth');
  protected readonly hint = signal<string>('DD/MM/YYYY');
  protected readonly min = signal<string>('1950-01-01');
  protected readonly max = signal<string>('2008-12-31');
  protected readonly required = signal<boolean>(true);

  protected readonly control = new FormControl<string>('1997-03-14', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  /** Every form event (value, status, touched) re-reads the errors; the status alone can stay INVALID. */
  protected readonly controlEvents = toSignal(this.control.events);
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly errorsText = computed<string>(() => {
    this.controlEvents();

    return JSON.stringify(this.control.errors);
  });

  protected readonly disabledControl = new FormControl<string>({ value: '2024-09-01', disabled: true }, { nonNullable: true });
  protected readonly calendarValue = signal<string>('2026-11-12');

  protected readonly whenToUse: readonly string[] = [
    'Enter a date that people may know by heart (date of birth) or need to look up (an interview date).',
    'Set min and max to keep the date in a valid range; out-of-range dates fail validation.',
    'Typing stays possible: never force people to click through months for a date of birth.',
  ];

  protected readonly exampleStart = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleInterview = new FormControl<string>('', { nonNullable: true });
  protected readonly examplePassportExpiry = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
  protected readonly exampleGraduated = new FormControl<string>({ value: '2021-06-30', disabled: true }, { nonNullable: true });
}
