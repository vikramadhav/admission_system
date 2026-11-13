import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DAHC_ICON_NAMES,
  DahcButtonComponent,
  DahcButtonSize,
  DahcButtonVariant,
  DahcIconName,
  DahcSpaceComponent,
} from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

type IconChoice = 'none' | DahcIconName;


@Component({
  selector: 'dahc-button-page',
  templateUrl: './button-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcSpaceComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    RouterLink,
  ],
})
export class ButtonPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Use a primary button for the one main action of a page or step, such as Next or Submit application.',
    'Use secondary and link buttons for supporting actions such as Save as draft, Back or Cancel.',
    'Use danger or danger-outline for actions that delete or withdraw, and confirm them with a modal or popconfirm.',
    'Put dahc-button on an a element when the action navigates; keep a button element for actions.',
  ];

  protected readonly sourceFiles = ['actions/button/button.component.ts', 'actions/button/button.component.html', 'actions/button/button.component.css'];
  protected readonly variants: readonly DahcButtonVariant[] = [
    'primary',
    'secondary',
    'link',
    'danger',
    'danger-outline',
    'special-blue',
    'special-green',
  ];
  protected readonly iconChoices: readonly IconChoice[] = ['none', ...DAHC_ICON_NAMES];
  protected readonly sizes: readonly DahcButtonSize[] = ['sm', 'md', 'lg'];

  protected readonly text = signal<string>('Save draft');
  protected readonly variant = signal<DahcButtonVariant>('primary');
  protected readonly size = signal<DahcButtonSize>('md');
  protected readonly disabled = signal<boolean>(false);
  protected readonly loading = signal<boolean>(false);
  protected readonly block = signal<boolean>(false);
  protected readonly loadingLabel = signal<string>('Please wait');
  protected readonly iconStartChoice = signal<IconChoice>('none');
  protected readonly iconEndChoice = signal<IconChoice>('chevron-right');
  protected readonly iconStart = computed<DahcIconName | null>(() => toIcon(this.iconStartChoice()));
  protected readonly iconEnd = computed<DahcIconName | null>(() => toIcon(this.iconEndChoice()));
  protected readonly events = signal<readonly string[]>([]);

  protected recordClick(): void {
    this.events.update(events => [`click (${this.variant()})`, ...events]);
  }
}

function toIcon(choice: IconChoice): DahcIconName | null {
  return choice === 'none' ? null : choice;
}
