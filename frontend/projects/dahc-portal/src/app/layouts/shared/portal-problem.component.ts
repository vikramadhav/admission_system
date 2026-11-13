import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DahcAlertComponent } from 'dahc-ui';

import { ProblemNotificationService } from '../../core/api/problem-notification.service';

/** The message area for API problems that no page handled itself: localized detail, issues and trace id. */
@Component({
  selector: 'dahc-portal-problem',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent],
  styles: `
    :host { display: block; }
    .problem { max-inline-size: var(--dahc-size-container-max); margin-inline: auto; padding-block-start: var(--dahc-space-4); padding-inline: var(--dahc-space-4); }
    @media (min-width: 48rem) { .problem { padding-inline: var(--dahc-space-6); } }
    .problem-list { margin-block: var(--dahc-space-2); padding-inline-start: var(--dahc-space-6); }
    p { margin: 0; }
  `,
  template: `
    @if (problem(); as current) {
      <div class="problem">
        <dahc-alert variant="error" [announce]="true" [dismissible]="true" (dismissed)="notifications.clear()">
          <p>{{ current.detail ?? current.title }}</p>
          @if (current.errors?.length) {
            <ul class="problem-list">
              @for (issue of current.errors; track $index) {
                <li>{{ issue.detail }}</li>
              }
            </ul>
          }
          @if (current.traceId) {
            <p i18n="@@portal.problem.traceId">Reference for support: {{ current.traceId }}</p>
          }
        </dahc-alert>
      </div>
    }
  `,
})
export class PortalProblemComponent {
  protected readonly notifications = inject(ProblemNotificationService);
  protected readonly problem = this.notifications.problem;
}
