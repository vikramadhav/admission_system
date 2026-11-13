import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcStatisticComponent, DahcStatisticSize } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-statistic-page',
  templateUrl: './statistic-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcStatisticComponent, InspectorChoiceComponent, PlaygroundPageComponent],
})
export class StatisticPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show a key number in content, such as program counts on a landing page.',
    'Use prefix and suffix for currency and units; numbers are formatted for the locale.',
    'Use Stat tile for coloured dashboard scores.',
  ];

  protected readonly sourceFiles = [
    'data-display/statistic/statistic.component.ts',
    'data-display/statistic/statistic.component.css',
  ];

  protected readonly sizes = ['md', 'lg'] as const;
  protected readonly size = signal<DahcStatisticSize>('md');
}
