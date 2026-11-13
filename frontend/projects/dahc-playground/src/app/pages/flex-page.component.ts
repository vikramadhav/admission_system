import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcFlexAlign, DahcFlexComponent, DahcFlexGap, DahcFlexJustify, DahcTagComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-flex-page',
  templateUrl: './flex-page.component.html',
  styles: '.flex-demo { padding: var(--dahc-space-4); border: var(--dahc-size-border) dashed var(--dahc-color-border-default); border-radius: var(--dahc-radius-md); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcFlexComponent,
    DahcTagComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class FlexPageComponent {
  protected readonly whenToUse = [
    'Lay out a few items in a row or a column with consistent spacing, without writing CSS.',
    'Push items apart (justify="between"), for example a title and its actions.',
    'Turn wrap on when the items can be wider than a phone screen, so content reflows at 320 pixels.',
    'Keep the source order meaningful: flex does not change the reading or tab order.',
  ];

  protected readonly sourceFiles = ['layout/flex/flex.component.ts', 'layout/flex/flex.component.css', 'layout/flex/flex-alignment.css'];

  protected readonly gaps: readonly DahcFlexGap[] = ['none', 'sm', 'md', 'lg'];
  protected readonly justifies: readonly DahcFlexJustify[] = ['', 'start', 'center', 'end', 'between', 'around', 'evenly'];
  protected readonly aligns: readonly DahcFlexAlign[] = ['', 'start', 'center', 'end', 'baseline', 'stretch'];

  protected readonly vertical = signal<boolean>(false);
  protected readonly wrap = signal<boolean>(false);
  protected readonly gap = signal<DahcFlexGap>('md');
  protected readonly justify = signal<DahcFlexJustify>('');
  protected readonly align = signal<DahcFlexAlign>('');
}
