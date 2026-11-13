import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcNavLink, DahcPageHeaderComponent, DahcPageHeaderMeta, DahcTagComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-page-header-page',
  templateUrl: './page-header-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcPageHeaderComponent,
    DahcTagComponent,
    DocExampleComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class PageHeaderPageComponent {
  protected readonly whenToUse = [
    'Start every page with one page header: it holds the page\'s only h1.',
    'Put the status of the object (Draft, Submitted) in page-header-status and the main action in page-header-actions.',
    'Use meta for a few key facts, such as the application number and dates.',
    'Turn focusOnLoad on in single-page applications so screen readers hear the new page title.',
  ];

  protected readonly sourceFiles = [
    'navigation/page-header/page-header.component.ts',
    'navigation/page-header/page-header.component.html',
    'navigation/page-header/page-header.component.css',
  ];

  protected readonly heading = signal<string>('Dashboard');
  protected readonly description = signal<string>('Welcome, Aisha. Track your GME applications and next steps here.');
  protected readonly showActions = signal<boolean>(true);
  protected readonly showBreadcrumbs = signal<boolean>(true);
  protected readonly showMeta = signal<boolean>(true);
  protected readonly showStatus = signal<boolean>(true);
  protected readonly breadcrumbs: readonly DahcNavLink[] = [
    { label: 'Home', route: '/foundations/colour' },
    { label: 'My applications', route: '/table' },
    { label: 'Medical application' },
  ];
  protected readonly meta: readonly DahcPageHeaderMeta[] = [
    { label: 'Application ID', value: 'GME-2026-000142' },
    { label: 'Program', value: 'Medical Residency' },
  ];
  /** Focus moves on first render only, so the preview starts with it off. */
  protected readonly focusOnLoad = signal<boolean>(false);
}
