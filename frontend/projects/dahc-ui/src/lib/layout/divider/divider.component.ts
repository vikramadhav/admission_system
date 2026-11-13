import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A line between content: horizontal (with an optional centred `label`) or `vertical` between
 * inline items. Without a label it is a separator for assistive technology, unless `decorative`
 * hides it. With a label the line is drawn around the text and the text is read as normal
 * content (a separator would hide its text).
 * Ported from dubai-health-ui dh-divider (feedback/dh-feedback.ts). DERIVED: DH divider colour.
 */
@Component({
  selector: 'dahc-divider',
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-divider',
    '[class.dahc-divider--vertical]': 'vertical()',
    '[class.dahc-divider--labelled]': 'hasLabel()',
    '[attr.role]': 'role()',
    '[attr.aria-orientation]': "role() === 'separator' ? (vertical() ? 'vertical' : 'horizontal') : null",
    '[attr.aria-hidden]': "decorative() ? 'true' : null",
  },
})
export class DahcDividerComponent {
  readonly vertical = input<boolean>(false);
  /** Text in the middle of a horizontal divider, for example "or". */
  readonly label = input<string>('');
  /** Hides the line from assistive technology when it is only visual. */
  readonly decorative = input<boolean>(false);

  protected readonly hasLabel = computed<boolean>(() => this.label() !== '' && !this.vertical());
  protected readonly role = computed<string | null>(() => (this.decorative() || this.hasLabel() ? null : 'separator'));
}
