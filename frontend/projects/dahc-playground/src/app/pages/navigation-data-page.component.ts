import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcPaginationComponent, DahcStep, DahcStepsComponent, DahcTabPanelComponent, DahcTabsComponent, DahcTabsTone } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

/** Tabs, steps and pagination: the navigation pieces ported with the data batch. */
@Component({
  selector: 'dahc-navigation-data-page',
  templateUrl: './navigation-data-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcPaginationComponent,
    DahcStepsComponent,
    DahcTabPanelComponent,
    DahcTabsComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    PlaygroundPageComponent,
  ],
})
export class NavigationDataPageComponent {
  protected readonly whenToUse = [
    'Tabs: switch between views of the same object, such as an application overview and its documents.',
    'Steps: show where the user is in a short process and what comes next.',
    'Pagination: move through long lists, together with the page size of the table.',
    'Do not use tabs for steps that must be done in order; use steps or the wizard.',
  ];

  protected readonly sourceFiles = [
    'navigation/tabs/tabs.component.ts',
    'navigation/tabs/tabs.component.css',
    'navigation/steps/steps.component.ts',
    'navigation/steps/steps.component.css',
    'navigation/pagination/pagination.component.ts',
    'navigation/pagination/pagination.component.css',
  ];
  protected readonly tones: readonly DahcTabsTone[] = ['default', 'inverse'];
  protected readonly directions: readonly ('horizontal' | 'vertical')[] = ['vertical', 'horizontal'];
  protected readonly steps: readonly DahcStep[] = [
    { heading: 'Program and preferences' },
    { heading: 'Application information' },
    { heading: 'Personal information', description: '4 sections' },
    { heading: 'University grades', status: 'error', description: 'Upload your transcript' },
    { heading: 'Pay and submit' },
  ];

  protected readonly tone = signal<DahcTabsTone>('default');
  protected readonly activeTab = signal<string>('overview');
  protected readonly direction = signal<'horizontal' | 'vertical'>('vertical');
  protected readonly currentStep = signal<number>(2);
  protected readonly page = signal<number>(1);
}
