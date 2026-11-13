import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DahcAppHeaderComponent } from 'dahc-ui';
import { filter } from 'rxjs';

import { LanguageLink, LocaleService } from '../../core/locale/locale.service';
import { PortalFooterComponent } from '../shared/portal-footer.component';
import { PortalProblemComponent } from '../shared/portal-problem.component';

/** Layout of the pages reached before or outside a role area: sign-in, sign-in outcomes, not found. */
@Component({
  selector: 'dahc-public-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAppHeaderComponent, PortalFooterComponent, PortalProblemComponent, RouterOutlet],
  styleUrl: '../shared/layout.scss',
  template: `
    <dahc-app-header
      i18n-productName="@@portal.productName"
      productName="GME Admissions"
      logoSrc="brand/mbru-logo.svg"
      i18n-logoAlt="@@portal.brand.logoAlt"
      logoAlt="Dubai Health, Mohammed Bin Rashid University of Medicine and Health Sciences"
      mainContentId="main-content"
      [languageHref]="languageLink()?.href ?? ''"
      [languageLabel]="languageLink()?.label ?? ''"
      [languageCode]="languageLink()?.languageCode ?? ''" />
    <main id="main-content" class="dahc-layout-main" tabindex="-1">
      <dahc-portal-problem />
      <router-outlet />
    </main>
    <dahc-portal-footer />
  `,
})
export class PublicLayoutComponent {
  private readonly locale = inject(LocaleService);
  private readonly navigationEnd = toSignal(inject(Router).events.pipe(filter(event => event instanceof NavigationEnd)));

  protected readonly languageLink = computed<LanguageLink | null>(() => {
    this.navigationEnd();

    return this.locale.otherLanguageLink();
  });
}
