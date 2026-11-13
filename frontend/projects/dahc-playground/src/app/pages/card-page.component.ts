import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DahcTagComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcCardHeadingLevel,
  DahcCardVariant,
} from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-card-page',
  templateUrl: './card-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,
    DahcTagComponent,
    DahcButtonComponent,
    DahcCardComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class CardPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Group the information and actions about one item, such as an application on a dashboard.',
    'Give it a heading when it stands for an item; the card then becomes an article named by that heading.',
    'Use subtle for supporting information and elevated, sparingly, to lift one card above a busy page.',
    'Use List for many short items and Table when items share fields that people compare.',
  ];

  protected readonly sourceFiles = ['data-display/card/card.component.ts', 'data-display/card/card.component.html', 'data-display/card/card.component.css'];
  protected readonly variants: readonly DahcCardVariant[] = ['default', 'subtle', 'actionable'];
  protected readonly headingLevels: readonly DahcCardHeadingLevel[] = [2, 3];

  protected readonly variant = signal<DahcCardVariant>('default');
  protected readonly eyebrow = signal<string>('Application ID');
  protected readonly heading = signal<string>('20270000001');
  protected readonly headingLevel = signal<DahcCardHeadingLevel>(2);
  protected readonly subheading = signal<string>('Medical Residency');
  protected readonly showAside = signal<boolean>(true);
  protected readonly showFooter = signal<boolean>(true);
  protected readonly elevated = signal<boolean>(false);
}
