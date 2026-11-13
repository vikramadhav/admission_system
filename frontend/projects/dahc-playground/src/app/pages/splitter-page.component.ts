import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcSplitterComponent, DahcSplitterLayout, DahcSplitterPanelComponent } from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, InspectorChoiceComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-splitter-page',
  templateUrl: './splitter-page.component.html',
  styles: `
    .splitter-demo { block-size: 14rem; border: var(--dahc-size-border) solid var(--dahc-color-border-subtle); border-radius: var(--dahc-radius-md); }
    .splitter-pane { block-size: 100%; margin: 0; padding: var(--dahc-space-4); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcSplitterComponent,
    DahcSplitterPanelComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    PlaygroundPageComponent,
  ],
})
export class SplitterPageComponent {
  protected readonly whenToUse = [
    'Show a list and the details of the selected item side by side, and let the user decide how much room each gets.',
    'Compare two documents or panels in a review screen.',
    'Set min and max so a pane can never become too small to use.',
    'Name each handle with label so keyboard and screen-reader users know what they resize.',
  ];

  protected readonly sourceFiles = [
    'layout/splitter/splitter.component.ts',
    'layout/splitter/splitter-panel.component.html',
    'layout/splitter/splitter-panel.component.css',
    'layout/splitter/splitter.component.css',
  ];

  protected readonly layouts: readonly DahcSplitterLayout[] = ['horizontal', 'vertical'];
  protected readonly layout = signal<DahcSplitterLayout>('horizontal');
  protected readonly events = signal<readonly string[]>([]);

  protected onResized(sizes: readonly number[]): void {
    this.events.update(events => [`resized (${sizes.map(size => Math.round(size)).join(', ')})`, ...events].slice(0, 5));
  }
}
