import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DahcAlertComponent, DahcAppHeaderComponent } from 'dahc-ui';
import { filter } from 'rxjs';

import { ProblemNotificationService } from './core/api/problem-notification.service';
import { AuthService } from './core/auth/auth.service';
import { SessionService } from './core/auth/session.service';
import { LanguageLink, LocaleService } from './core/locale/locale.service';

/** Application shell: header, the message area for API problems, and the routed page. */
@Component({
  selector: 'dahc-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcAppHeaderComponent, RouterOutlet],
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly locale = inject(LocaleService);
  private readonly notifications = inject(ProblemNotificationService);
  private readonly navigationEnd = toSignal(inject(Router).events.pipe(filter(event => event instanceof NavigationEnd)));

  protected readonly session = inject(SessionService).session;
  protected readonly problem = this.notifications.problem;
  protected readonly languageLink = computed<LanguageLink | null>(() => {
    this.navigationEnd();

    return this.locale.otherLanguageLink();
  });

  constructor() {
    // A message belongs to the page it was raised on.
    effect(() => {
      this.navigationEnd();
      this.notifications.clear();
    });
  }

  protected signOut(): void {
    void this.auth.signOut();
  }

  protected dismissProblem(): void {
    this.notifications.clear();
  }
}
