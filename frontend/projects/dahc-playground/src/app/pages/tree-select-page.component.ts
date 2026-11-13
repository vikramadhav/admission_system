import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcTreeSelectComponent, DahcTreeSelectNode } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-tree-select-page',
  templateUrl: './tree-select-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcTreeSelectComponent, DocExampleComponent, PlaygroundPageComponent, ReactiveFormsModule],
})
export class TreeSelectPageComponent {
  protected readonly sourceFiles = [
    'forms/tree-select/tree-select.component.ts',
    'forms/tree-select/tree-select.component.html',
    'forms/tree-select/tree-select.component.css',
  ];
  protected readonly control = new FormControl<string>('cardiology', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly departments: readonly DahcTreeSelectNode[] = [
    {
      value: 'medicine',
      label: 'Medicine',
      children: [
        { value: 'cardiology', label: 'Cardiology' },
        { value: 'endocrinology', label: 'Endocrinology' },
        { value: 'nephrology', label: 'Nephrology', disabled: true },
      ],
    },
    { value: 'surgery', label: 'Surgery', children: [{ value: 'general-surgery', label: 'General surgery' }, { value: 'orthopaedics', label: 'Orthopaedics' }] },
    { value: 'paediatrics', label: 'Paediatrics' },
  ];

  protected readonly whenToUse: readonly string[] = [
    'Choose one item from a hierarchy, such as a department within a service line.',
    'Set selectableParents when a whole branch is a valid choice.',
    'Use a cascader when each level should be chosen in turn, and a select for a flat list.',
  ];

  protected readonly exampleSpecialty = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleServiceLine = new FormControl<string>('surgery', { nonNullable: true });
  protected readonly exampleUnit = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
}
