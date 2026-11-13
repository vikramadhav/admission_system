import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcFloatButtonComponent, DahcFloatButtonPlacement, DahcFloatButtonVariant } from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-float-button-page',
  templateUrl: './float-button-page.component.html',
  styles: `.float-row { display: flex; gap: var(--dahc-space-4); padding-inline-start: var(--dahc-space-16); }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcFloatButtonComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class FloatButtonPageComponent {
  protected readonly whenToUse = [
    'One action that must always be reachable, such as contacting the admissions team.',
    'Use href when the action opens a page, so it is a real link.',
    'Use placement start for the opposite corner, for example when a chat widget already uses the end corner.',
    'Use at most one float button per page.',
  ];

  protected readonly sourceFiles = [
    'navigation/float-button/float-button.component.ts',
    'navigation/float-button/float-button.component.html',
    'navigation/float-button/float-button.component.css',
  ];
  protected readonly variants: readonly DahcFloatButtonVariant[] = ['primary', 'default'];
  protected readonly placements: readonly DahcFloatButtonPlacement[] = ['end', 'start'];

  protected readonly label = signal<string>('Contact us');
  protected readonly variant = signal<DahcFloatButtonVariant>('primary');
  protected readonly placement = signal<DahcFloatButtonPlacement>('end');
  protected readonly inline = signal<boolean>(true);
  protected readonly events = signal<readonly string[]>([]);

  protected record(): void {
    this.events.update(events => ['click', ...events]);
  }
}
