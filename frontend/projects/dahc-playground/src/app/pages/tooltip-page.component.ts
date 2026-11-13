import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcIconButtonComponent, DahcPlacement, DahcSpaceComponent, DahcTooltipDirective } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-tooltip-page',
  templateUrl: './tooltip-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcIconButtonComponent,
    DahcSpaceComponent,
    DahcTooltipDirective,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class TooltipPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Explain an icon button or a short label, such as what the points of a question mean.',
    'Keep it to one short sentence; never put essential information only in a tooltip.',
    'Use a popover for longer or interactive content.',
  ];

  protected readonly sourceFiles = ['feedback/tooltip/tooltip.directive.ts'];
  protected readonly placements: readonly DahcPlacement[] = ['top', 'bottom', 'start', 'end'];

  protected readonly text = signal<string>('Points are added to your portfolio score.');
  protected readonly placement = signal<DahcPlacement>('top');
}
