import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcPhoneInputComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-phone-input-page',
  templateUrl: './phone-input-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcPhoneInputComponent,
    DocExampleComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class PhoneInputPageComponent {
  protected readonly sourceFiles = [
    'forms/phone-input/phone-input.component.ts',
    'forms/phone-input/phone-input.component.html',
    'forms/phone-input/phone-input.component.css',
  ];

  protected readonly label = signal<string>('Mobile number');
  protected readonly hint = signal<string>('We send application updates by SMS.');

  protected readonly control = new FormControl<string>('+971501234567', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly controlEvents = toSignal(this.control.events);
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly errorsText = computed<string>(() => {
    this.controlEvents();

    return JSON.stringify(this.control.errors);
  });

  protected readonly emptyControl = new FormControl<string>('', { nonNullable: true });
  protected readonly disabledControl = new FormControl<string>({ value: '+966551234567', disabled: true }, { nonNullable: true });

  protected readonly whenToUse: readonly string[] = [
    'Ask for a phone number that may be outside the UAE.',
    'Set defaultCountry to the most likely country so most people only type the number.',
    'Use a plain text field only for extensions or internal numbers without a country code.',
  ];

  protected readonly exampleWorkPhone = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleSaudiPhone = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleEmergency = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
}
