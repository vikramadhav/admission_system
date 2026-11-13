import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DahcSegmentedComponent, DahcSegmentedOption } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-segmented-page',
  templateUrl: './segmented-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcSegmentedComponent, DocExampleComponent, PlaygroundPageComponent, ReactiveFormsModule],
})
export class SegmentedPageComponent {
  protected readonly sourceFiles = [
    'forms/segmented/segmented.component.ts',
    'forms/segmented/segmented.component.html',
    'forms/segmented/segmented.component.css',
  ];
  protected readonly control = new FormControl<string>('week', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly options: readonly DahcSegmentedOption[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year', disabled: true },
  ];

  protected readonly whenToUse: readonly string[] = [
    'Switch between two to five related views or modes, such as Day / Week / Month.',
    'Use a radio group for form questions, and tabs when each option shows a different panel of content.',
    'Keep labels to one or two words so the segments stay on one line.',
  ];

  protected readonly exampleViews: readonly DahcSegmentedOption[] = [
    { value: 'list', label: 'List' },
    { value: 'cards', label: 'Cards' },
  ];
  protected readonly exampleView = new FormControl<string>('list', { nonNullable: true });
  protected readonly exampleTerms: readonly DahcSegmentedOption[] = [
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'autumn', label: 'Autumn', disabled: true },
  ];
  protected readonly exampleTerm = new FormControl<string>('spring', { nonNullable: true });
  protected readonly exampleSizes: readonly DahcSegmentedOption[] = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'spacious', label: 'Spacious' },
  ];
  protected readonly exampleDensity = new FormControl<string>('comfortable', { nonNullable: true });
}
