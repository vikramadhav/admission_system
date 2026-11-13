import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcTagAppearance, DahcTagComponent, DahcTagPurpose, DahcTagSize } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorTextComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-tag-page',
  templateUrl: './tag-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcTagComponent, InspectorChoiceComponent, InspectorTextComponent, PlaygroundPageComponent],
})
export class TagPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Label the status or category of an item, such as Draft, Submitted or Uploaded.',
    'Choose the purpose by meaning (warning, success, error) and keep the text explicit.',
    'Use the large outline tag for a page-level status and the medium solid tag inside rows and cards.',
    'Use Badge for counts and Button for anything clickable; tags are not interactive.',
  ];

  protected readonly sourceFiles = [
    'data-display/tag/tag.component.ts',
    'data-display/tag/tag.component.html',
    'data-display/tag/tag.component.css',
  ];
  protected readonly purposes: readonly DahcTagPurpose[] = [
    'information',
    'in-progress',
    'warning',
    'error',
    'success',
    'news',
    'informative-blue',
    'informative-purple',
  ];
  protected readonly appearances: readonly DahcTagAppearance[] = ['solid', 'outline'];
  protected readonly sizes: readonly DahcTagSize[] = ['lg', 'md'];

  protected readonly text = signal<string>('Draft');
  protected readonly purpose = signal<DahcTagPurpose>('warning');
  protected readonly appearance = signal<DahcTagAppearance>('outline');
  protected readonly size = signal<DahcTagSize>('lg');
}
