import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcResultComponent, DahcResultStatus } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-result-page',
  templateUrl: './result-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcResultComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class ResultPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Confirm the end of a task, such as Your application has been submitted.',
    'Explain a failure and offer a retry, such as a failed payment.',
    'Fill a whole page for not-found or not-allowed states (set headingLevel to 1).',
  ];

  protected readonly sourceFiles = [
    'feedback/result/result.component.ts',
    'feedback/result/result.component.html',
    'feedback/result/result.component.css',
  ];
  protected readonly statuses: readonly DahcResultStatus[] = ['success', 'error', 'warning', 'info'];

  protected readonly status = signal<DahcResultStatus>('success');
  protected readonly heading = signal<string>('Your application has been submitted');
  protected readonly subtitle = signal<string>('The admission team will review it. You can follow its progress on your dashboard.');
}
