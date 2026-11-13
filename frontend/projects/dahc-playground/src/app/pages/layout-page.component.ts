import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DahcContentComponent,
  DahcHeaderComponent,
  DahcLayoutComponent,
  DahcLayoutFooterComponent,
  DahcSiderBreakpoint,
  DahcSiderComponent,
} from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorChoiceComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-layout-page',
  templateUrl: './layout-page.component.html',
  styles: `
    .layout-demo { display: flex; min-block-size: 22rem; overflow: hidden; border: var(--dahc-size-border) solid var(--dahc-color-border-subtle); border-radius: var(--dahc-radius-md); }
    .layout-links { display: grid; gap: var(--dahc-space-2); margin: 0; padding-inline: var(--dahc-space-4); list-style: none; }
    .layout-text { margin: 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcContentComponent,
    DahcHeaderComponent,
    DahcLayoutComponent,
    DahcLayoutFooterComponent,
    DahcSiderComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class LayoutPageComponent {
  protected readonly whenToUse = [
    'Give an application its overall frame: header at the top, content in the middle, footer at the bottom.',
    'Add a side navigation (dahc-sider) for back-office tools with many sections.',
    'Let the sider collapse on smaller screens with breakpoint, so content keeps its width.',
    'Use one main landmark per page: set landmark to false on dahc-content when it sits inside another main.',
  ];

  protected readonly sourceFiles = [
    'layout/layout/layout.component.ts',
    'layout/layout/header.component.ts',
    'layout/layout/content.component.ts',
    'layout/layout/layout-footer.component.ts',
    'layout/layout/sider.component.ts',
    'layout/layout/sider.component.html',
    'layout/layout/sider.component.css',
  ];

  protected readonly breakpoints: readonly DahcSiderBreakpoint[] = ['', 'sm', 'md', 'lg', 'xl', 'xxl'];
  protected readonly collapsible = signal<boolean>(true);
  protected readonly collapsed = signal<boolean>(false);
  protected readonly breakpoint = signal<DahcSiderBreakpoint>('');
  protected readonly events = signal<readonly string[]>([]);

  protected onCollapse(collapsed: boolean): void {
    this.events.update(events => [`collapseChange (${collapsed})`, ...events]);
  }
}
