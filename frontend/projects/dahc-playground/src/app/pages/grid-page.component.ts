import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcColComponent, DahcFlexGap, DahcRowComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-grid-page',
  templateUrl: './grid-page.component.html',
  styles: `
    .grid-cell {
      padding: var(--dahc-space-3);
      border-radius: var(--dahc-radius-sm);
      background-color: var(--dahc-color-surface-highlight);
      color: var(--dahc-color-text-primary);
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcColComponent, DahcRowComponent, DocExampleComponent, InspectorChoiceComponent, PlaygroundPageComponent],
})
export class GridPageComponent {
  protected readonly whenToUse = [
    'Build page and form layouts that change with the screen width, for example two form columns on desktop and one on phones.',
    'Align content to a consistent 24-column rhythm across pages.',
    'Use the gutter for spacing between columns instead of margins on the content.',
    'Set span 24 for phones (or leave it out) so columns stack and content reflows at 320 pixels.',
  ];

  protected readonly sourceFiles = [
    'layout/grid/row.component.ts',
    'layout/grid/row.component.css',
    'layout/grid/col.component.ts',
    'layout/grid/col.component.css',
  ];

  protected readonly gaps: readonly DahcFlexGap[] = ['none', 'sm', 'md', 'lg'];
  protected readonly gutter = signal<DahcFlexGap>('lg');
  protected readonly verticalGutter = signal<DahcFlexGap>('md');
}
