import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Main area of a dahc-layout on the DH page background. It renders the page's main landmark;
 * set `landmark` to false when the layout sits inside another main region (for example a demo).
 * Ported from dubai-health-ui dh-content (layout/dh-layout.ts).
 */
@Component({
  selector: 'dahc-content',
  templateUrl: './content.component.html',
  styleUrl: './content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: 'dahc-content' },
})
export class DahcContentComponent {
  readonly landmark = input<boolean>(true);
}
