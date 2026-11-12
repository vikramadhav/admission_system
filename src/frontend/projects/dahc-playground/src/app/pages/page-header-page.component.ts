import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcPageHeaderComponent } from 'dahc-ui';

import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { InspectorToggleComponent } from '../inspector/inspector-toggle.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-page-header-page',
  templateUrl: './page-header-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcPageHeaderComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class PageHeaderPageComponent {
  protected readonly sourceFiles = [
    'page-header/page-header.component.ts',
    'page-header/page-header.component.html',
    'page-header/page-header.component.scss',
  ];

  protected readonly heading = signal<string>('Dashboard');
  protected readonly description = signal<string>('Welcome, Aisha. Track your GME applications and next steps here.');
  protected readonly showActions = signal<boolean>(true);
  /** Focus moves on first render only, so the preview starts with it off. */
  protected readonly focusOnLoad = signal<boolean>(false);
}
