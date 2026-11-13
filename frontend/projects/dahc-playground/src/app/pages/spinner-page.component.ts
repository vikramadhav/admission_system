import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcSpaceComponent, DahcSpinnerComponent, DahcSpinnerSize } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-spinner-page',
  templateUrl: './spinner-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcSpaceComponent,
    DahcSpinnerComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class SpinnerPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show that a section or page is loading data of unknown length.',
    'Use the button loading state instead of a spinner next to a button.',
    'Use a skeleton when you know the shape of the content that will appear.',
  ];

  protected readonly sourceFiles = ['feedback/spinner/spinner.component.ts', 'feedback/spinner/spinner.component.css'];
  protected readonly sizes: readonly DahcSpinnerSize[] = ['md', 'sm', 'lg'];

  protected readonly label = signal<string>('Loading your applications');
  protected readonly size = signal<DahcSpinnerSize>('md');
}
