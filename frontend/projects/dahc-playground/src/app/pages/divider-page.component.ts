import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcDividerComponent, DahcLinkComponent, DahcSpaceComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-divider-page',
  templateUrl: './divider-page.component.html',
  styles: '.divider-text { margin: 0; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcDividerComponent,
    DahcLinkComponent,
    DahcSpaceComponent,
    DocExampleComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class DividerPageComponent {
  protected readonly whenToUse = [
    'Separate groups of content in a card or a long form.',
    'Put a short label such as "or" between two alternatives, for example UAE Pass and a Dubai Health account.',
    'Use the vertical divider between inline links or actions in a toolbar.',
    'Mark it decorative when the line is purely visual, so screen readers do not announce a separator.',
  ];

  protected readonly sourceFiles = [
    'layout/divider/divider.component.ts',
    'layout/divider/divider.component.html',
    'layout/divider/divider.component.css',
  ];

  protected readonly label = signal<string>('or');
  protected readonly decorative = signal<boolean>(false);
}
