import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcNavMenuComponent, DahcNavMenuItemComponent, DahcNavMenuMode, DahcNavSubMenuComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-nav-menu-page',
  templateUrl: './nav-menu-page.component.html',
  styles: `.nav-menu-vertical { max-inline-size: 18rem; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcNavMenuComponent,
    DahcNavMenuItemComponent,
    DahcNavSubMenuComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    PlaygroundPageComponent,
  ],
})
export class NavMenuPageComponent {
  protected readonly whenToUse = [
    'The main navigation of a site or an application, horizontal in a header.',
    'A vertical side menu for applications with many sections, with sub-menus for groups.',
    'Mark the current page with selected so it has aria-current="page".',
    'For actions (not pages) use Menu or Dropdown instead.',
  ];

  protected readonly sourceFiles = [
    'navigation/nav-menu/nav-menu.component.ts',
    'navigation/nav-menu/nav-menu.component.html',
    'navigation/nav-menu/nav-menu-item.component.html',
    'navigation/nav-menu/nav-sub-menu.component.html',
    'navigation/nav-menu/nav-menu.component.css',
  ];
  protected readonly modes: readonly DahcNavMenuMode[] = ['horizontal', 'vertical'];
  protected readonly mode = signal<DahcNavMenuMode>('horizontal');
  protected readonly subMenuOpen = signal<boolean>(true);
}
