import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonSize, DahcButtonVariant, DahcMenuComponent, DahcMenuItem } from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-menu-page',
  templateUrl: './menu-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcMenuComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class MenuPageComponent {
  protected readonly whenToUse = [
    'Several actions on one object, such as an application in a list, behind a single button.',
    'Keep rarely used or destructive actions out of the main toolbar.',
    'For your own trigger element use Dropdown; for site navigation use the Navigation menu.',
    'Disabled items stay in the list so users can discover them.',
  ];

  protected readonly sourceFiles = [
    'actions/menu/menu.component.ts',
    'actions/menu/menu.component.html',
    'actions/menu/menu.component.css',
    'core/overlay/position.ts',
  ];
  protected readonly variants: readonly DahcButtonVariant[] = ['secondary', 'primary', 'link'];
  protected readonly sizes: readonly DahcButtonSize[] = ['sm', 'md', 'lg'];
  protected readonly items: readonly DahcMenuItem[] = [
    { value: 'view', label: 'View application', icon: 'view' },
    { value: 'print', label: 'Print summary', icon: 'print' },
    { value: 'appeal', label: 'Appeal score', disabled: true },
    { value: 'withdraw', label: 'Withdraw application', icon: 'trash', danger: true },
  ];

  protected readonly label = signal<string>('Actions');
  protected readonly variant = signal<DahcButtonVariant>('secondary');
  protected readonly size = signal<DahcButtonSize>('md');
  protected readonly disabled = signal<boolean>(false);
  protected readonly events = signal<readonly string[]>([]);

  protected record(value: string): void {
    this.events.update(events => [`itemSelected (${value})`, ...events]);
  }
}
