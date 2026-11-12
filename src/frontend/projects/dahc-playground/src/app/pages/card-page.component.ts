import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DahcBadgeComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcCardHeadingLevel,
  DahcCardVariant,
} from 'dahc-ui';

import { InspectorChoiceComponent } from '../inspector/inspector-choice.component';
import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { InspectorToggleComponent } from '../inspector/inspector-toggle.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-card-page',
  templateUrl: './card-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcBadgeComponent,
    DahcButtonComponent,
    DahcCardComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class CardPageComponent {
  protected readonly sourceFiles = ['card/card.component.ts', 'card/card.component.html', 'card/card.component.scss'];
  protected readonly variants: readonly DahcCardVariant[] = ['default', 'subtle'];
  protected readonly headingLevels: readonly DahcCardHeadingLevel[] = [2, 3];

  protected readonly variant = signal<DahcCardVariant>('default');
  protected readonly eyebrow = signal<string>('Application ID');
  protected readonly heading = signal<string>('20270000001');
  protected readonly headingLevel = signal<DahcCardHeadingLevel>(2);
  protected readonly subheading = signal<string>('Medical Residency');
  protected readonly showAside = signal<boolean>(true);
  protected readonly showFooter = signal<boolean>(true);
}
