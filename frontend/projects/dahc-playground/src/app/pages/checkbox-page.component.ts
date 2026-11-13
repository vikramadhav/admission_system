import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcCheckboxComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-checkbox-page',
  templateUrl: './checkbox-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcCheckboxComponent,
    DocExampleComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class CheckboxPageComponent {
  protected readonly sourceFiles = [
    'forms/checkbox/checkbox.component.ts',
    'forms/checkbox/checkbox.component.html',
    'forms/checkbox/checkbox.component.css',
  ];

  protected readonly text = signal<string>('I confirm the information I provided is accurate.');
  protected readonly indeterminate = signal<boolean>(false);
  protected readonly invalid = signal<boolean>(false);
  protected readonly disabled = signal<boolean>(false);

  protected readonly control = new FormControl<boolean>(false, { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));

  protected readonly checkedControl = new FormControl<boolean>(true, { nonNullable: true });
  protected readonly disabledControl = new FormControl<boolean>({ value: false, disabled: true }, { nonNullable: true });
  protected readonly disabledCheckedControl = new FormControl<boolean>({ value: true, disabled: true }, { nonNullable: true });

  protected readonly whenToUse: readonly string[] = [
    'Pick any number of options from a short list, or confirm one statement such as accepting the terms.',
    'Use a switch when the change applies immediately, and a radio group when only one option may be chosen.',
    'Group related checkboxes in a fieldset with a legend, so screen readers announce the question with each option.',
    'Checkboxes are submitted with the form; they never trigger an action on their own.',
  ];

  protected readonly exampleConsent = new FormControl<boolean>(false, { nonNullable: true });
  protected readonly exampleChannels = new FormGroup({
    email: new FormControl<boolean>(true, { nonNullable: true }),
    sms: new FormControl<boolean>(false, { nonNullable: true }),
    call: new FormControl<boolean>(false, { nonNullable: true }),
  });
  protected readonly exampleTerms = new FormControl<boolean>(false, { nonNullable: true, validators: Validators.requiredTrue });
  protected readonly exampleManaged = new FormControl<boolean>({ value: true, disabled: true }, { nonNullable: true });
}
