import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcTimePickerComponent } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-time-picker-page',
  templateUrl: './time-picker-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcTimePickerComponent, DocExampleComponent, PlaygroundPageComponent, ReactiveFormsModule],
})
export class TimePickerPageComponent {
  protected readonly sourceFiles = [
    'forms/time-picker/time-picker.component.ts',
    'forms/time-picker/time-picker.component.html',
    'forms/time-picker/time-picker.component.css',
  ];
  protected readonly control = new FormControl<string>('09:30', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly disabledControl = new FormControl<string>({ value: '14:00', disabled: true }, { nonNullable: true });

  protected readonly whenToUse: readonly string[] = [
    'Enter a time of day, such as an appointment or a shift start.',
    'Use min, max and step to offer only valid slots, for example every 30 minutes during clinic hours.',
    'Pair it with a date picker when both the day and the time are needed.',
  ];

  protected readonly exampleCallTime = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleSlot = new FormControl<string>('10:00', { nonNullable: true });
  protected readonly exampleShift = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
  protected readonly exampleArrival = new FormControl<string>('08:15:30', { nonNullable: true });
}
