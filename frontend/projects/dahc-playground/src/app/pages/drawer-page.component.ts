import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcDrawerComponent, DahcDrawerPlacement, DahcDrawerSize, DahcSpaceComponent } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-drawer-page',
  templateUrl: './drawer-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcDrawerComponent,
    DahcSpaceComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class DrawerPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show filters, settings or details without leaving the current page.',
    'Hold the navigation menu on small screens.',
    'Use a modal instead for confirmations and short decisions.',
  ];

  protected readonly startOpen = signal<boolean>(false);
  protected readonly smallOpen = signal<boolean>(false);
  protected readonly footerOpen = signal<boolean>(false);

  protected readonly sourceFiles = [
    'feedback/dialog/drawer.component.ts',
    'feedback/dialog/drawer.component.html',
    'feedback/dialog/drawer.component.css',
    'feedback/dialog/dialog-base.ts',
  ];
  protected readonly placements: readonly DahcDrawerPlacement[] = ['end', 'start'];
  protected readonly sizes: readonly DahcDrawerSize[] = ['md', 'sm'];

  protected readonly heading = signal<string>('Filter applications');
  protected readonly placement = signal<DahcDrawerPlacement>('end');
  protected readonly size = signal<DahcDrawerSize>('md');
  protected readonly open = signal<boolean>(false);
}
