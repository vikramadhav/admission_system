import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcEmptyStateComponent, DahcHeadingLevel } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-empty-state-page',
  templateUrl: './empty-state-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcEmptyStateComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class EmptyStatePageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show when a list, table or dashboard section has no data yet, such as no applications.',
    'Show when a search or filter returns nothing, with a way to clear it.',
    'Offer one clear next action; keep the description to one or two sentences.',
  ];

  protected readonly sourceFiles = [
    'feedback/empty-state/empty-state.component.ts',
    'feedback/empty-state/empty-state.component.html',
    'feedback/empty-state/empty-state.component.css',
  ];
  protected readonly headingLevels: readonly DahcHeadingLevel[] = [2, 3];

  protected readonly heading = signal<string>('You have no applications yet');
  protected readonly description = signal<string>('When you start an application, it appears here with its status and next steps.');
  protected readonly headingLevel = signal<DahcHeadingLevel>(2);
  protected readonly showAction = signal<boolean>(true);
}
