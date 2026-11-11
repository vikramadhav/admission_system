import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcBadgeComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcEmptyStateComponent,
  DahcPageHeaderComponent,
} from 'dahc-ui';

import { AnnouncedScores } from '../../api/application.models';
import { DashboardApiService } from '../../api/dashboard-api.service';
import { CandidateDashboardItem, StartNewApplicationState } from '../../api/dashboard.models';
import { SessionService } from '../../core/auth/session.service';
import { formatDahcDateTime } from '../../core/locale/date-time.pipe';
import { ApplicationStatusDisplay, applicationStatusDisplay } from './application-status-display';

interface InboxItemView {
  readonly id: string;
  readonly applicationNumber: string;
  readonly programName: string;
  readonly status: ApplicationStatusDisplay;
  readonly details: readonly DahcDetailItem[];
  readonly scores: readonly DahcDetailItem[];
  readonly canResume: boolean;
}

/**
 * Candidate dashboard (US-1.2.1): welcome, the start-new state as decided by the API,
 * the application inbox with the actions the API allows, and the session time-out note.
 */
@Component({
  selector: 'dahc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcBadgeComponent,
    DahcButtonComponent,
    DahcCardComponent,
    DahcDetailListComponent,
    DahcEmptyStateComponent,
    DahcPageHeaderComponent,
    RouterLink,
  ],
})
export class DashboardComponent {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly startNewReasonId = 'start-new-application-reason';
  protected readonly dashboard = rxResource({ stream: () => this.dashboardApi.getCandidateDashboard() });
  private readonly response = computed(() => (this.dashboard.hasValue() ? this.dashboard.value() : null));

  protected readonly welcome = computed<string>(() => {
    const name = this.sessions.session()?.displayName ?? '';

    return $localize`:@@portal.dashboard.welcome:Welcome, ${name}:name:. Track your GME applications and next steps here.`;
  });

  protected readonly startNew = computed<StartNewApplicationState | null>(
    () => this.response()?.data.startNewApplication ?? null,
  );

  protected readonly startNewReason = computed<string>(() => {
    const state = this.startNew();

    if (state === null || state.enabled) {
      return '';
    }

    if (state.disabledReason === 'ACTIVE_APPLICATION_EXISTS') {
      return $localize`:@@portal.dashboard.activeExists:You already have an active application in this cycle.`;
    }

    const opensAt = this.formatDate(state.nextCycleOpensAt);

    return opensAt === ''
      ? $localize`:@@portal.dashboard.noOpenProgram:No program is open for applications at the moment.`
      : $localize`:@@portal.dashboard.nextOpening:No program is open for applications at the moment. Applications open on ${opensAt}:date:.`;
  });

  protected readonly items = computed<readonly InboxItemView[]>(() =>
    (this.response()?.data.items ?? []).map(item => this.toView(item)),
  );

  protected readonly emptyMessage = computed<string>(
    () =>
      this.response()?.message ??
      $localize`:@@portal.dashboard.emptyDescription:When you start an application, it appears here with its status and next steps.`,
  );

  protected readonly sessionTimeoutNote = computed<string>(() => {
    const minutes = this.response()?.data.sessionTimeoutMinutes;

    return minutes === undefined
      ? $localize`:@@portal.dashboard.timeoutGeneric:For your security, your session ends after a period of inactivity. Save your work often.`
      : $localize`:@@portal.dashboard.timeout:For your security, your session ends after ${minutes}:minutes: minutes of inactivity. Save your work often.`;
  });

  private toView(item: CandidateDashboardItem): InboxItemView {
    const details: DahcDetailItem[] = [
      { label: $localize`:@@portal.dashboard.program:Program`, value: item.program.name },
      { label: $localize`:@@portal.dashboard.created:Created`, value: this.formatDate(item.createdAt) },
      { label: $localize`:@@portal.dashboard.submitted:Submitted`, value: this.formatDate(item.submittedAt) },
      {
        label: $localize`:@@portal.dashboard.deadline:Submission deadline`,
        value: this.formatDate(item.submissionDeadline, 'dateTime'),
      },
    ];

    if (item.announcementDate) {
      details.push({
        label: $localize`:@@portal.dashboard.announcement:Announcement`,
        value: this.formatDate(item.announcementDate),
      });
    }

    if (item.appealDeadline) {
      details.push({
        label: $localize`:@@portal.dashboard.appealDeadline:Appeal deadline`,
        value: this.formatDate(item.appealDeadline, 'dateTime'),
      });
    }

    return {
      id: item.id,
      applicationNumber: item.applicationNumber,
      programName: item.program.name,
      status: applicationStatusDisplay(item.status),
      details,
      scores: this.toScores(item.announcedScores ?? null),
      canResume: item.allowedActions.includes('RESUME'),
    };
  }

  /** Scores are present only after the official announcement (D-11); the portal shows what it receives. */
  private toScores(scores: AnnouncedScores | null): DahcDetailItem[] {
    if (scores === null) {
      return [];
    }

    const numberFormat = new Intl.NumberFormat(this.locale);
    const items: DahcDetailItem[] = [
      {
        label: $localize`:@@portal.dashboard.portfolioScore:Portfolio final score`,
        value: numberFormat.format(scores.finalPortfolioScore),
      },
      {
        label: $localize`:@@portal.dashboard.shortlistingScore:Shortlisting score`,
        value: numberFormat.format(scores.shortlistingScore),
      },
    ];

    if (scores.gpaShortlistingScore !== null && scores.gpaShortlistingScore !== undefined) {
      items.push({
        label: $localize`:@@portal.dashboard.gpaScore:GPA score`,
        value: numberFormat.format(scores.gpaShortlistingScore),
      });
    }

    if (scores.examShortlistingScore !== null && scores.examShortlistingScore !== undefined) {
      items.push({
        label: $localize`:@@portal.dashboard.examScore:Entrance exam score`,
        value: numberFormat.format(scores.examShortlistingScore),
      });
    }

    return items;
  }

  private formatDate(value: string | null | undefined, style: 'date' | 'dateTime' = 'date'): string {
    return formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), style);
  }
}
