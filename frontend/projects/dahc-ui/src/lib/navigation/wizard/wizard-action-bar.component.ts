import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Bar with the actions of a wizard step: secondary actions at the start ([dahcActionsStart],
 * for example Save as draft and Discard) and navigation at the end ([dahcActionsEnd], Back and
 * Next). Sticky at the bottom of the viewport by default, so the actions stay in reach.
 * GME sticky action bar: full-width white bar, padding 24/40, top border (the GME 2% shadow is
 * not visible and is left out); buttons 48px.
 * The wrapping on small screens is DERIVED.
 */
@Component({
  selector: 'dahc-wizard-action-bar',
  template: `
    <div class="dahc-wizard-action-bar__inner">
      <div class="dahc-wizard-action-bar__group"><ng-content select="[dahcActionsStart]" /></div>
      <div class="dahc-wizard-action-bar__group dahc-wizard-action-bar__group--end"><ng-content select="[dahcActionsEnd]" /></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      border-block-start: var(--dahc-size-border) solid var(--dahc-color-border-subtle);
      background-color: var(--dahc-color-surface);
    }
    :host(.dahc-wizard-action-bar--sticky) {
      position: sticky;
      inset-block-end: 0;
      z-index: var(--dahc-z-sticky);
    }
    .dahc-wizard-action-bar__inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--dahc-space-3);
      max-inline-size: var(--dahc-size-container-max);
      margin-inline: auto;
      padding: var(--dahc-space-4);
    }
    .dahc-wizard-action-bar__group {
      display: flex;
      flex-wrap: wrap;
      gap: var(--dahc-space-3);
    }
    .dahc-wizard-action-bar__group--end {
      margin-inline-start: auto;
    }
    @media (min-width: 48rem) {
      .dahc-wizard-action-bar__inner {
        padding: var(--dahc-space-6) var(--dahc-space-10);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[attr.aria-label]': 'label()',
    '[class.dahc-wizard-action-bar--sticky]': 'sticky()',
  },
})
export class DahcWizardActionBarComponent {
  readonly sticky = input<boolean>(true);
  readonly label = input<string>($localize`:@@dahcUi.wizard.actions:Step actions`);
}
