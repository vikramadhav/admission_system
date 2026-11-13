import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DahcTimelineComponent, DahcTimelineItemComponent } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-timeline-page',
  templateUrl: './timeline-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcTimelineComponent, DahcTimelineItemComponent, PlaygroundPageComponent],
})
export class TimelinePageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show what happened and when, such as the history of an application.',
    'Use status to show progress; the status is also given in text.',
    'Use the wizard stepper or Steps for a process the user moves through, not a record of events.',
  ];

  protected readonly sourceFiles = [
    'data-display/timeline/timeline.component.ts',
    'data-display/timeline/timeline-item.component.css',
  ];
}
