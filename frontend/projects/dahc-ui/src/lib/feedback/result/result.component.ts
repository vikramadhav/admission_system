import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type DahcResultStatus = 'success' | 'error' | 'warning' | 'info';
export type DahcResultHeadingLevel = 1 | 2 | 3;

/**
 * Outcome page or panel (submitted, failed, not found): a featured status icon, heading, subtitle
 * and actions (content). The outcome is announced: role="alert" for errors, role="status" otherwise.
 * DERIVED design (UDD-019): 52px featured icon on the status tint with a soft ring, H2 heading,
 * centred. Ported from dubai-health-ui dh-result (display/dh-data-display.ts); headingLevel is a
 * DAHC addition so the result can be the page's h1.
 */
@Component({
  selector: 'dahc-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    '[class]': "'dahc-result--' + status()",
  },
})
export class DahcResultComponent {
  readonly status = input<DahcResultStatus>('success');
  readonly heading = input.required<string>();
  readonly subtitle = input<string>('');
  readonly headingLevel = input<DahcResultHeadingLevel>(2);
}
