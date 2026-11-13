import { ChangeDetectionStrategy, Component, effect, inject, input, model, signal, untracked } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

/**
 * Group of expandable sections. By default opening one section closes the others; with
 * [multiple] any number can be open.
 * <dahc-accordion><dahc-accordion-item heading="Eligibility">…</dahc-accordion-item></dahc-accordion>
 * Figma Content Components › FDP Specialty accordion 50:17721. Ported from dubai-health-ui
 * (packages/components/src/display/dh-collapse.ts).
 */
@Component({
  selector: 'dahc-accordion',
  template: '<ng-content />',
  styles: ':host { display: block; border-block-start: var(--dahc-size-border) solid var(--dahc-color-border-subtle); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DahcAccordionComponent {
  /** Allows several sections to be open at once. */
  readonly multiple = input<boolean>(false);

  /** The section opened last; in single mode the other sections close. */
  readonly lastOpened = signal<string | null>(null);
}

/** Heading level of the section titles, to fit the page outline. */
export type DahcAccordionHeadingLevel = 2 | 3 | 4;

/**
 * One section of a dahc-accordion: a heading button that shows and hides its panel
 * (WAI-ARIA accordion pattern: Enter / Space toggle, the button reports aria-expanded).
 * Figma 50:17721: 62px header, padding 16, gap 12, optional 30px icon on blue-100, Bold 16/18 navy
 * title, chevron, navy-100 divider. Hover, focus and disabled are DERIVED, pending UX sign-off.
 */
@Component({
  selector: 'dahc-accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
})
export class DahcAccordionItemComponent {
  readonly heading = input.required<string>();
  /** Whether the section is open: [(expanded)]. */
  readonly expanded = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  /** Icon in the 30px disc before the title. */
  readonly icon = input<DahcIconName | null>(null);
  readonly headingLevel = input<DahcAccordionHeadingLevel>(3);

  private readonly accordion = inject(DahcAccordionComponent, { optional: true });
  protected readonly id = dahcUniqueId('dahc-accordion');
  protected readonly buttonId = `${this.id}-button`;
  protected readonly panelId = `${this.id}-panel`;

  constructor() {
    // In single mode this section closes itself (and reports it through expandedChange) when
    // another section of the same accordion opens.
    effect(() => {
      const accordion = this.accordion;
      const opened = accordion?.lastOpened();

      if (accordion && !accordion.multiple() && opened && opened !== this.id && untracked(this.expanded)) {
        this.expanded.set(false);
      }
    });
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }

    const open = !this.expanded();
    this.expanded.set(open);

    if (open) {
      this.accordion?.lastOpened.set(this.id);
    }
  }
}
