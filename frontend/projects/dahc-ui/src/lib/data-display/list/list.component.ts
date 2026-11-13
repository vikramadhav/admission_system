import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

/**
 * A list of items, for example GME "Before you begin" or the section-completion checklist:
 * <dahc-list [divided]="true"><dahc-list-item heading="CV" description="PDF">…aside…</dahc-list-item></dahc-list>
 * DERIVED from the DH FAQ list and Dropdown suggestion rows (Menu Item / Underlined: navy-100
 * dividers) and the GME checklists. Pending UX sign-off.
 * Ported from dubai-health-ui (display/dh-data-display.ts, DhList / DhListItem).
 */
@Component({
  selector: 'dahc-list',
  template: '<ng-content />',
  styleUrl: './list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'list',
    '[class.dahc-list--divided]': 'divided() || bordered()',
    '[class.dahc-list--bordered]': 'bordered()',
  },
})
export class DahcListComponent {
  /** Draws a navy-100 line between items. */
  readonly divided = input<boolean>(false);
  /** dh-list bordered: a navy-100 frame with radius 12 around the items (implies dividers). */
  readonly bordered = input<boolean>(false);
}

/**
 * One item (dh-list-item): leading media ([dahcListAvatar], or the `icon` input), a heading, an
 * optional description, trailing content ([dahcListAside]) and trailing actions ([dahcListActions]).
 */
@Component({
  selector: 'dahc-list-item',
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    role: 'listitem',
  },
})
export class DahcListItemComponent {
  readonly heading = input.required<string>();
  readonly description = input<string>('');
  readonly icon = input<DahcIconName | null>(null);
}
