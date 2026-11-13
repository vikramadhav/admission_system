import { ChangeDetectionStrategy, Component, computed, contentChildren } from '@angular/core';

import { DahcSiderComponent } from './sider.component';

/**
 * Page frame: stacks dahc-header, dahc-content and dahc-layout-footer on the page background,
 * and becomes a row when it directly contains a dahc-sider (nest another dahc-layout beside the
 * sider for header, content and footer).
 * Ported from dubai-health-ui dh-layout (layout/dh-layout.ts). Figma DH Top navigation 50:10832,
 * Bottom navigation 50:11046.
 */
@Component({
  selector: 'dahc-layout',
  template: '<ng-content />',
  styleUrl: './layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-layout',
    '[class.dahc-layout--has-sider]': 'hasSider()',
  },
})
export class DahcLayoutComponent {
  private readonly siders = contentChildren(DahcSiderComponent);

  protected readonly hasSider = computed<boolean>(() => this.siders().length > 0);
}
