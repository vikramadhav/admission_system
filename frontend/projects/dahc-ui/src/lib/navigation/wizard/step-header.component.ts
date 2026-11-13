import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Heading of one wizard step: "STEP 2 OF 9" above the step title (an h2).
 * GME step header: eyebrow Medium 12 uppercase with 0.72px tracking, title Bold 22 (Subheading
 * scale aligned to DH Heading 3, decision D3).
 */
@Component({
  selector: 'dahc-step-header',
  template: `
    <p class="dahc-step-header__eyebrow">{{ eyebrow() }}</p>
    <h2 class="dahc-step-header__heading">{{ heading() }}</h2>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: var(--dahc-space-1); }
    .dahc-step-header__eyebrow {
      margin: 0;
      color: var(--dahc-color-text-secondary);
      font-size: var(--dahc-font-size-12);
      font-weight: var(--dahc-font-weight-medium);
      letter-spacing: var(--dahc-font-letter-spacing-caps);
      line-height: var(--dahc-type-overline-line-height);
      text-transform: uppercase;
    }
    .dahc-step-header__heading {
      margin: 0;
      color: var(--dahc-color-text-primary);
      font-size: var(--dahc-type-heading-3-size);
      font-weight: var(--dahc-type-heading-3-weight);
      line-height: var(--dahc-type-heading-3-line-height);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DahcStepHeaderComponent {
  readonly heading = input.required<string>();
  /** Current step, 1-based. */
  readonly step = input.required<number>();
  readonly total = input.required<number>();

  protected readonly eyebrow = computed<string>(
    () => $localize`:@@dahcUi.wizard.stepOf:Step ${this.step()}:step: of ${this.total()}:total:`,
  );
}
