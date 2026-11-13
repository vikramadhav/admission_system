import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcFormFieldComponent, DahcFormFieldStatus, DahcIconComponent, DahcInputDirective } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

type FieldType = 'text' | 'email' | 'password' | 'tel' | 'textarea';

@Component({
  selector: 'dahc-form-field-page',
  templateUrl: './form-field-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcFormFieldComponent,
    DahcIconComponent,
    DahcInputDirective,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class FormFieldPageComponent {
  protected readonly sourceFiles = [
    'forms/form-field/form-field.component.ts',
    'forms/form-field/form-field.component.html',
    'forms/form-field/form-field.component.css',
    'forms/input/input.directive.ts',
  ];
  protected readonly types: readonly FieldType[] = ['text', 'email', 'password', 'tel', 'textarea'];
  protected readonly statuses: readonly DahcFormFieldStatus[] = ['none', 'success'];

  protected readonly label = signal<string>('Email address');
  protected readonly hint = signal<string>('We send your application receipt here.');
  protected readonly error = signal<string>('Enter your email address.');
  protected readonly placeholder = signal<string>('name@example.com');
  protected readonly type = signal<FieldType>('email');
  protected readonly status = signal<DahcFormFieldStatus>('none');
  protected readonly required = signal<boolean>(true);
  protected readonly readonly = signal<boolean>(false);
  protected readonly hideLabel = signal<boolean>(false);
  protected readonly withIcon = signal<boolean>(false);
  /** Drives the form control's disabled state. */
  protected readonly disabled = signal<boolean>(false);

  protected readonly control = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));

  protected readonly filledControl = new FormControl<string>('Aisha Al Mansoori', { nonNullable: true });
  protected readonly errorControl = new FormControl<string>('not-an-email', { nonNullable: true });
  protected readonly disabledControl = new FormControl<string>({ value: '784-1990-1234567-1', disabled: true }, { nonNullable: true });

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.control.disable();
      } else {
        this.control.enable();
      }
    });
  }

  protected readonly whenToUse: readonly string[] = [
    'Ask for free text: names, e-mail addresses, numbers that are codes (IDs, phone) and longer answers in a textarea.',
    'Keep the native element: dahcInput only styles it, so browser features such as autocomplete and input modes keep working.',
    'Use the hint for format help before people type; the error replaces it when the value is not valid.',
    'Show read-only verified values (for example from ICP) with status success and a hint saying where they came from.',
  ];

  protected readonly exampleFullName = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleCoverNote = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleUsername = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleWorkEmail = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] });
}
