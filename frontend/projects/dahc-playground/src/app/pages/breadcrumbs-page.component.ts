import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcBreadcrumbsComponent, DahcBreadcrumbsTone, DahcLogoComponent, DahcNavLink } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-breadcrumbs-page',
  templateUrl: './breadcrumbs-page.component.html',
  styles: '.on-navy { padding: var(--dahc-space-4); border-radius: var(--dahc-radius-md); background: var(--dahc-color-surface-inverse); } .logos { display: flex; flex-wrap: wrap; gap: var(--dahc-space-6); align-items: center; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcBreadcrumbsComponent,
    DahcLogoComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class BreadcrumbsPageComponent {
  protected readonly whenToUse = [
    'Show the path to the current page in applications with more than two levels.',
    'Put it at the top of the page, above the page heading; the page header does this for you.',
    'Use the light tone on navy and other dark surfaces.',
    'The last item is the current page and is not a link.',
  ];

  protected readonly sourceFiles = [
    'navigation/breadcrumbs/breadcrumbs.component.ts',
    'navigation/breadcrumbs/breadcrumbs.component.html',
    'navigation/breadcrumbs/breadcrumbs.component.css',
    'navigation/logo/logo.component.ts',
    'navigation/nav-link.ts',
  ];
  protected readonly tones: readonly DahcBreadcrumbsTone[] = ['dark', 'light'];
  protected readonly items: readonly DahcNavLink[] = [
    { label: 'Home', route: '/foundations/colour' },
    { label: 'My applications', route: '/table' },
    { label: 'Medical application', route: '/breadcrumbs' },
    { label: 'Personal information' },
  ];

  protected readonly tone = signal<DahcBreadcrumbsTone>('dark');
  protected readonly homeIcon = signal<boolean>(true);
}
