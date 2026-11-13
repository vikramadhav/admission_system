import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcFlexGap, DahcLinkComponent, DahcSpaceComponent, DahcTagComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-space-page',
  templateUrl: './space-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcLinkComponent,
    DahcSpaceComponent,
    DahcTagComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class SpacePageComponent {
  protected readonly whenToUse = [
    'Space a row of buttons, links or tags evenly without writing CSS.',
    'Use a larger gap to separate groups of actions.',
    'Turn wrap on for rows that can be wider than a phone screen.',
    'It adds no role, so the source order stays the reading order.',
  ];

  protected readonly sourceFiles = ['layout/space/space.component.ts', 'layout/space/space.component.css', 'layout/flex/flex-alignment.css'];

  protected readonly gaps: readonly DahcFlexGap[] = ['none', 'sm', 'md', 'lg'];
  protected readonly gap = signal<DahcFlexGap>('sm');
  protected readonly wrap = signal<boolean>(true);
  protected readonly block = signal<boolean>(false);
}
