import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DahcProgressComponent, DahcProgressSize, DahcProgressStatus, DahcProgressType, DahcSpaceComponent } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-progress-page',
  templateUrl: './progress-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcProgressComponent,
    DahcSpaceComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class ProgressPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show the progress of an upload, a multi-step form or a profile completion.',
    'Use a spinner instead when the length of the work is unknown.',
    'Say the outcome in text as well; colour alone does not tell success or failure.',
  ];

  protected readonly sourceFiles = [
    'feedback/progress/progress.component.ts',
    'feedback/progress/progress.component.html',
    'feedback/progress/progress.component.css',
  ];
  protected readonly types: readonly DahcProgressType[] = ['line', 'circle'];
  protected readonly sizes: readonly DahcProgressSize[] = ['sm', 'md', 'lg'];
  protected readonly statuses: readonly DahcProgressStatus[] = ['normal', 'success', 'error'];
  protected readonly values: readonly string[] = ['60', '0', '30', '100'];

  protected readonly label = signal<string>('Application progress');
  protected readonly valueText = signal<string>('60');
  protected readonly value = computed<number>(() => Number(this.valueText()));
  protected readonly type = signal<DahcProgressType>('line');
  protected readonly size = signal<DahcProgressSize>('md');
  protected readonly status = signal<DahcProgressStatus>('normal');
  protected readonly showValue = signal<boolean>(true);
}
