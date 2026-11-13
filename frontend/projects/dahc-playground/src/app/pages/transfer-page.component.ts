import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DahcTransferComponent, DahcTransferItem, DahcTransferMove } from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-transfer-page',
  templateUrl: './transfer-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcTransferComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class TransferPageComponent {
  protected readonly sourceFiles = [
    'forms/transfer/transfer.component.ts',
    'forms/transfer/transfer.component.html',
    'forms/transfer/transfer.component.css',
  ];
  protected readonly control = new FormControl<readonly string[]>(['radiology'], { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly programmes: readonly DahcTransferItem[] = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'surgery', label: 'General surgery', disabled: true },
    { value: 'paediatrics', label: 'Paediatrics' },
  ];
  protected readonly searchable = signal<boolean>(true);
  protected readonly events = signal<readonly string[]>([]);

  protected onMoved(move: DahcTransferMove): void {
    this.events.update(events => [`moved (${move.direction}: ${move.values.join(', ')})`, ...events]);
  }

  protected readonly whenToUse: readonly string[] = [
    'Choose several items from a long list when people need to see both what is available and what they chose.',
    'Turn on search when either list may hold more than about ten items.',
    'Use a multi-select for shorter lists, where a dropdown is enough.',
  ];

  protected readonly exampleModules: readonly DahcTransferItem[] = [
    { value: 'ethics', label: 'Medical ethics' },
    { value: 'research', label: 'Research methods' },
    { value: 'leadership', label: 'Clinical leadership' },
    { value: 'quality', label: 'Quality and safety' },
  ];
  protected readonly exampleChosenModules = new FormControl<readonly string[]>(['ethics'], { nonNullable: true });
  protected readonly exampleHospitals: readonly DahcTransferItem[] = [
    { value: 'rashid', label: 'Rashid Hospital' },
    { value: 'dubai', label: 'Dubai Hospital' },
    { value: 'latifa', label: 'Latifa Hospital' },
    { value: 'hatta', label: 'Hatta Hospital' },
    { value: 'al-jalila', label: 'Al Jalila Children Hospital' },
  ];
  protected readonly exampleChosenHospitals = new FormControl<readonly string[]>([], { nonNullable: true });
  protected readonly exampleRotations: readonly DahcTransferItem[] = [
    { value: 'emergency', label: 'Emergency medicine (required)', disabled: true },
    { value: 'icu', label: 'Intensive care' },
    { value: 'radiology', label: 'Radiology' },
  ];
  protected readonly exampleChosenRotations = new FormControl<readonly string[]>(['emergency'], { nonNullable: true });
}
