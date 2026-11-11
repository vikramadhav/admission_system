import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcSelectComponent, DahcSelectOption } from 'dahc-ui';

import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { InspectorToggleComponent } from '../inspector/inspector-toggle.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-select-page',
  templateUrl: './select-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcSelectComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class SelectPageComponent {
  protected readonly sourceFiles = [
    'select/select.component.ts',
    'select/select.component.html',
    'select/select.component.scss',
    'select/select-option.ts',
    'a11y/unique-id.ts',
  ];

  protected readonly programs: readonly DahcSelectOption[] = [
    { value: 'internship', label: 'Internship' },
    { value: 'medical-residency', label: 'Medical Residency' },
    { value: 'dental-residency', label: 'Dental Residency' },
    { value: 'pharmacy-residency', label: 'Pharmacy Residency' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'certificate', label: 'Certificate (closed)', disabled: true },
  ];

  protected readonly label = signal<string>('Program');
  protected readonly placeholder = signal<string>('Select an option');
  protected readonly description = signal<string>('Only programs open in this cycle are listed.');
  protected readonly errorMessage = signal<string>('Select a program.');
  protected readonly invalid = signal<boolean>(false);
  protected readonly required = signal<boolean>(true);
  /** Drives the form control's disabled state, which reaches the component through setDisabledState. */
  protected readonly disabled = signal<boolean>(false);

  protected readonly control = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));

  protected readonly filledControl = new FormControl<string>('fellowship', { nonNullable: true });
  protected readonly invalidControl = new FormControl<string>('', { nonNullable: true });
  protected readonly disabledControl = new FormControl<string>({ value: 'internship', disabled: true }, { nonNullable: true });

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.control.disable();
      } else {
        this.control.enable();
      }
    });
  }
}
