import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DahcSpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Loading indicator for work of unknown length. A role="status" region announces the label
 * politely; the ring is decorative. Under reduced motion the ring turns three times slower.
 * DERIVED design (UDD-019): navy arc on a navy-100 ring; sm 20px, md 32px, lg 48px.
 * Ported from dubai-health-ui dh-spinner (feedback/dh-feedback.ts).
 */
@Component({
  selector: 'dahc-spinner',
  template: `
    <span class="dahc-spinner" role="status">
      <span class="dahc-spinner__ring" aria-hidden="true"></span>
      <span class="dahc-visually-hidden">{{ label() }}</span>
    </span>
  `,
  styleUrl: './spinner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dahc-spinner--sm]': "size() === 'sm'",
    '[class.dahc-spinner--lg]': "size() === 'lg'",
  },
})
export class DahcSpinnerComponent {
  readonly size = input<DahcSpinnerSize>('md');
  /** Text announced to screen readers. */
  readonly label = input<string>($localize`:@@dahcUi.spinner.label:Loading`);
}
