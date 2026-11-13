import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DahcSwitchComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-switch-page',
  templateUrl: './switch-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcSwitchComponent,
    DocExampleComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class SwitchPageComponent {
  protected readonly sourceFiles = [
    'forms/switch/switch.component.ts',
    'forms/switch/switch.component.html',
    'forms/switch/switch.component.css',
  ];

  protected readonly text = signal<string>('SMS reminders');
  protected readonly control = new FormControl<boolean>(false, { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));

  protected readonly onControl = new FormControl<boolean>(true, { nonNullable: true });
  protected readonly disabledControl = new FormControl<boolean>({ value: true, disabled: true }, { nonNullable: true });

  /** The switch inherits its disabled input from the shared form-control base. */
  protected readonly apiFiles = ['forms/switch/switch.component.ts', 'core/forms/form-control.ts'];

  protected readonly whenToUse: readonly string[] = [
    'Turn a single setting on or off when the change takes effect immediately, such as notifications.',
    'Use a checkbox for answers that are only submitted with a form.',
    'Keep the label short and describe the setting, not the state: "SMS reminders", not "Turn on SMS".',
  ];

  protected readonly exampleNotify = new FormControl<boolean>(true, { nonNullable: true });
  protected readonly exampleSettings = new FormGroup({
    reminders: new FormControl<boolean>(true, { nonNullable: true }),
    newsletter: new FormControl<boolean>(false, { nonNullable: true }),
  });
  protected readonly exampleRenewal = new FormControl<boolean>({ value: false, disabled: true }, { nonNullable: true });
}
