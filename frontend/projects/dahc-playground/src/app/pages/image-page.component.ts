import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcImageComponent, DahcImageRadius } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-image-page',
  templateUrl: './image-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcImageComponent, InspectorChoiceComponent, InspectorToggleComponent, PlaygroundPageComponent],
})
export class ImagePageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show a picture with alternative text; turn on preview when people need to see details, such as a scanned document.',
    'Use an empty alt only for decorative images.',
    'Match the radius to the surrounding cards (lg) or use md for inline images.',
  ];

  protected readonly sourceFiles = [
    'data-display/image/image.component.ts',
    'data-display/image/image.component.css',
    'data-display/image/image-preview.component.css',
  ];

  protected readonly radii = ['none', 'md', 'lg'] as const;
  protected readonly radius = signal<DahcImageRadius>('lg');
  protected readonly preview = signal<boolean>(true);
}
