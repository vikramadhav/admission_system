import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcWatermarkComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-watermark-page',
  templateUrl: './watermark-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcWatermarkComponent, InspectorTextComponent, PlaygroundPageComponent],
})
export class WatermarkPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Mark previews or printouts as confidential or draft.',
    'Keep the text short and use "|" for a second line, such as a reference number.',
    'Do not rely on a watermark for security; it is a deterrent only.',
  ];

  protected readonly sourceFiles = [
    'data-display/watermark/watermark.component.ts',
    'data-display/watermark/watermark.component.css',
  ];

  protected readonly content = signal<string>('Confidential | GME-2026-000123');
}
