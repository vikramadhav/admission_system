import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcEmptyStateComponent, DahcHeadingLevel } from 'dahc-ui';

import { InspectorChoiceComponent } from '../inspector/inspector-choice.component';
import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { InspectorToggleComponent } from '../inspector/inspector-toggle.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-empty-state-page',
  templateUrl: './empty-state-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcEmptyStateComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class EmptyStatePageComponent {
  protected readonly sourceFiles = [
    'empty-state/empty-state.component.ts',
    'empty-state/empty-state.component.html',
    'empty-state/empty-state.component.scss',
  ];
  protected readonly headingLevels: readonly DahcHeadingLevel[] = [2, 3];

  protected readonly heading = signal<string>('You have no applications yet');
  protected readonly description = signal<string>('When you start an application, it appears here with its status and next steps.');
  protected readonly headingLevel = signal<DahcHeadingLevel>(2);
  protected readonly showAction = signal<boolean>(true);
}
