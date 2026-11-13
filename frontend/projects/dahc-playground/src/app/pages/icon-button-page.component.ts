import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DAHC_ICON_NAMES,
  DahcIconButtonComponent,
  DahcIconButtonSize,
  DahcIconButtonVariant,
  DahcIconName,
  DahcSpaceComponent,
  DahcTooltipDirective,
} from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-icon-button-page',
  templateUrl: './icon-button-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcIconButtonComponent,
    DahcSpaceComponent,
    DahcTooltipDirective,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class IconButtonPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Use for compact, frequent actions whose icon is widely understood, such as search, menu, close or delete.',
    'Always write the text content: it is the accessible name read by screen readers.',
    'Add dahcTooltip when the icon alone may not be clear to sighted users.',
    'Prefer a labelled button for the main action of a page.',
  ];

  protected readonly sourceFiles = [
    'actions/icon-button/icon-button.component.ts',
    'actions/icon-button/icon-button.component.css',
  ];
  protected readonly icons = DAHC_ICON_NAMES;
  protected readonly variants: readonly DahcIconButtonVariant[] = ['outline', 'ghost'];
  protected readonly sizes: readonly DahcIconButtonSize[] = ['md', 'lg'];

  protected readonly icon = signal<DahcIconName>('search');
  protected readonly label = signal<string>('Search');
  protected readonly variant = signal<DahcIconButtonVariant>('outline');
  protected readonly size = signal<DahcIconButtonSize>('lg');
  protected readonly disabled = signal<boolean>(false);
  protected readonly events = signal<readonly string[]>([]);

  protected recordClick(): void {
    this.events.update(events => [`click (${this.label()})`, ...events]);
  }
}
