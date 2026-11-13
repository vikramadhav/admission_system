import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { ProblemNotificationService } from './core/api/problem-notification.service';

/** Root: the routed layout (public or a role area). A shown API problem belongs to the page it was raised on. */
@Component({
  selector: 'dahc-root',
  template: '<router-outlet />',
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AppComponent {
  private readonly notifications = inject(ProblemNotificationService);
  private readonly navigationEnd = toSignal(inject(Router).events.pipe(filter(event => event instanceof NavigationEnd)));

  constructor() {
    effect(() => {
      this.navigationEnd();
      this.notifications.clear();
    });
  }
}
