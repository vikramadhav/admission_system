import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcInputNumberComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-input-number-page',
  templateUrl: './input-number-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcInputNumberComponent,
    DocExampleComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class InputNumberPageComponent {
  protected readonly sourceFiles = [
    'forms/input-number/input-number.component.ts',
    'forms/input-number/input-number.component.html',
    'forms/input-number/input-number.component.css',
  ];
  protected readonly control = new FormControl<number | null>(4);
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly min = signal<number>(0);
  protected readonly max = signal<number>(10);
  protected readonly invalid = signal<boolean>(false);
  protected readonly disabledControl = new FormControl<number | null>({ value: 2, disabled: true });

  protected readonly whenToUse: readonly string[] = [
    'Enter an exact number, especially small counts such as dependants or years.',
    'Set min, max and step so the buttons and arrow keys stay within valid values.',
    'Use a slider for an approximate value, and a plain text field for numbers that are really codes, such as an ID or a phone number.',
  ];

  protected readonly exampleChildren = new FormControl<number | null>(null);
  protected readonly examplePractice = new FormControl<number | null>(3);
  protected readonly exampleGpa = new FormControl<number | null>(3.4);
  protected readonly exampleHousehold = new FormControl<number | null>(null, Validators.required);
}
