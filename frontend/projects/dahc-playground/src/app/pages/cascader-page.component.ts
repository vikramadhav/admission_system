import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcCascaderComponent, DahcCascaderNode } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-cascader-page',
  templateUrl: './cascader-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcCascaderComponent, DocExampleComponent, PlaygroundPageComponent, ReactiveFormsModule],
})
export class CascaderPageComponent {
  protected readonly sourceFiles = [
    'forms/cascader/cascader.component.ts',
    'forms/cascader/cascader.component.html',
    'forms/cascader/cascader.component.css',
  ];
  protected readonly control = new FormControl<readonly string[]>(['ae', 'dubai', 'deira'], { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly places: readonly DahcCascaderNode[] = [
    {
      value: 'ae',
      label: 'United Arab Emirates',
      children: [
        { value: 'dubai', label: 'Dubai', children: [{ value: 'deira', label: 'Deira' }, { value: 'marina', label: 'Dubai Marina' }, { value: 'hatta', label: 'Hatta' }] },
        { value: 'sharjah', label: 'Sharjah', children: [{ value: 'khan', label: 'Al Khan' }, { value: 'nahda', label: 'Al Nahda' }] },
        { value: 'fujairah', label: 'Fujairah', disabled: true },
      ],
    },
    { value: 'om', label: 'Oman', children: [{ value: 'muscat', label: 'Muscat' }] },
  ];

  protected readonly whenToUse: readonly string[] = [
    'Choose from a hierarchy of two to four levels where each level narrows the next, such as country, emirate and area.',
    'Use changeOnSelect when a parent level is a valid answer on its own.',
    'Use a tree select for deeper or uneven hierarchies, and separate selects when people need to see every level at once.',
  ];

  protected readonly exampleResidence = new FormControl<readonly string[]>([], { nonNullable: true });
  protected readonly exampleRegion = new FormControl<readonly string[]>(['ae', 'dubai'], { nonNullable: true });
  protected readonly exampleWork = new FormControl<readonly string[]>([], { nonNullable: true, validators: Validators.required });
}
