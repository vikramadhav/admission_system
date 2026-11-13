import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DahcSkeletonComponent } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-skeleton-page',
  templateUrl: './skeleton-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcSkeletonComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class SkeletonPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show while a card, list or detail page loads its data.',
    'Match the shape of the content that will appear: avatar, heading and number of rows.',
    'Use a spinner for short waits in small areas or after a button click.',
  ];

  protected readonly sourceFiles = ['feedback/skeleton/skeleton.component.ts', 'feedback/skeleton/skeleton.component.css'];
  protected readonly rowOptions: readonly string[] = ['3', '1', '2', '5'];

  protected readonly rowsText = signal<string>('3');
  protected readonly rows = computed<number>(() => Number(this.rowsText()));
  protected readonly avatar = signal<boolean>(true);
  protected readonly heading = signal<boolean>(true);
}
