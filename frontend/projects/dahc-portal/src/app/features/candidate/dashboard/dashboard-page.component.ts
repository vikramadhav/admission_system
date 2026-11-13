import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcIconComponent,
  DahcIconName,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcStatTileColor,
  DahcStatTileComponent,
  DahcTagComponent,
} from 'dahc-ui';
import { forkJoin, map } from 'rxjs';

import { Program } from '../../../api/catalog.models';
import { CatalogApiService } from '../../../api/catalog-api.service';
import { DashboardApiService } from '../../../api/dashboard-api.service';
import { CandidateApplicationAction, CandidateDashboardItem } from '../../../api/dashboard.models';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { InactivityService } from '../../../core/session/inactivity.service';
import { ApplicationStatusDisplay, applicationStatusDisplay } from '../../../shared/application-status';
import { CatalogNamesService, PreferenceView } from '../../../shared/catalog-names.service';
import { programRules } from '../../../shared/program-rules';
import { DiscardDraftDialogComponent } from '../actions/discard-draft-dialog.component';
import { EditPreferencesDrawerComponent } from '../actions/edit-preferences-drawer.component';
import { ExcludeSitesDialogComponent } from '../actions/exclude-sites-dialog.component';
import { ReinstateDialogComponent } from '../actions/reinstate-dialog.component';
import { WithdrawDialogComponent } from '../actions/withdraw-dialog.component';

interface ScoreTile {
  readonly label: string;
  readonly value: string;
  readonly color: DahcStatTileColor;
}

interface ItemView {
  readonly item: CandidateDashboardItem;
  readonly status: ApplicationStatusDisplay;
  readonly programLine: string;
  readonly details: readonly DahcDetailItem[];
  readonly preferences: readonly PreferenceView[];
  readonly scores: readonly ScoreTile[];
  readonly actions: ReadonlySet<CandidateApplicationAction>;
  readonly active: boolean;
}

interface CycleTile {
  readonly icon: DahcIconName;
  readonly value: string;
  readonly caption: string;
  readonly tone: 'blue' | 'red' | 'green';
}

type DialogKind = 'discard' | 'withdraw' | 'reinstate' | 'preferences' | 'exclude';

const INACTIVE = ['WITHDRAWN', 'ARCHIVED'];

/**
 * Candidate dashboard (US-1.2.1, US-4.3.2; Figma 1:5928 first-time, 1:1938 returning). Actions
 * come only from the API's allowedActions; scores appear only after the announcement.
 */
@Component({
  selector: 'dahc-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCardComponent,
    DahcDetailListComponent,
    DahcIconComponent,
    DahcPageHeaderComponent,
    DahcStatTileComponent,
    DahcTagComponent,
    DiscardDraftDialogComponent,
    EditPreferencesDrawerComponent,
    ExcludeSitesDialogComponent,
    NgTemplateOutlet,
    ReinstateDialogComponent,
    RouterLink,
    WithdrawDialogComponent,
  ],
})
export class DashboardPageComponent {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly names = inject(CatalogNamesService);
  private readonly sessions = inject(SessionService);
  private readonly inactivity = inject(InactivityService);
  private readonly locale = inject(LOCALE_ID);
  private readonly numbers = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 2 });

  protected readonly startReasonId = 'start-new-application-reason';
  protected readonly breadcrumbs: readonly DahcNavLink[] = [
    { label: $localize`:@@portal.nav.home:Home`, route: '/candidate/dashboard' },
    { label: $localize`:@@portal.dashboard.breadcrumb:Dashboard` },
  ];

  protected readonly dashboard = rxResource({ stream: () => this.dashboardApi.getCandidateDashboard().pipe(map(result => result.data)) });
  protected readonly data = computed(() => (this.dashboard.hasValue() ? this.dashboard.value() : null));
  protected readonly items = computed<readonly CandidateDashboardItem[]>(() => this.data()?.items ?? []);
  protected readonly startNew = computed(() => this.data()?.startNewApplication ?? null);
  protected readonly timeoutNoteVisible = signal<boolean>(true);

  private readonly preferenceNames = rxResource({
    params: () => (this.items().length > 0 ? this.items() : undefined),
    stream: ({ params }) => forkJoin(params.map(item => this.names.preferences(item.program.id, item.preferences))),
  });

  protected readonly programs = rxResource({
    params: () => (this.data() !== null && this.items().length === 0 ? true : undefined),
    stream: () => this.catalogApi.listPrograms().pipe(map(result => result.data)),
  });

  protected readonly firstName = computed<string>(() => (this.sessions.session()?.displayName ?? '').split(' ')[0] ?? '');

  protected readonly heading = computed<string>(() => {
    const name = this.firstName();

    return this.items().length === 0
      ? $localize`:@@portal.dashboard.welcomeHeading:Welcome, ${name}:name:`
      : $localize`:@@portal.dashboard.heading:Dashboard`;
  });

  protected readonly description = computed<string>(() => {
    const name = this.firstName();

    return this.items().length === 0
      ? $localize`:@@portal.dashboard.firstTimeSubtitle:Take the first step towards your GME journey.`
      : $localize`:@@portal.dashboard.returningSubtitle:Welcome back, ${name}:name:. Track your GME application and next steps.`;
  });

  protected readonly startReason = computed<string>(() => {
    const state = this.startNew();

    if (state === null || state.enabled) {
      return '';
    }

    if (state.disabledReason === 'ACTIVE_APPLICATION_EXISTS') {
      return $localize`:@@portal.dashboard.activeExists:You already have an active application in this cycle.`;
    }

    const opens = this.date(state.nextCycleOpensAt);

    return opens !== ''
      ? $localize`:@@portal.dashboard.noOpenProgramUntil:No program is open for applications. The next cycle opens on ${opens}:date:.`
      : $localize`:@@portal.dashboard.noOpenProgram:No program is open for applications right now.`;
  });

  protected readonly timeoutNote = computed<string>(() => {
    const minutes = this.data()?.sessionTimeoutMinutes ?? this.inactivity.timeoutMinutes;

    return $localize`:@@portal.dashboard.timeoutNote:For your security, you'll be signed out after ${minutes}:minutes: minutes of inactivity.`;
  });

  protected readonly views = computed<readonly ItemView[]>(() => {
    const names = this.preferenceNames.hasValue() ? this.preferenceNames.value() : [];

    return this.items().map((item, index) => this.toView(item, names[index] ?? []));
  });

  protected readonly activeView = computed<ItemView | null>(() => this.views().find(view => view.active) ?? null);
  protected readonly otherViews = computed<readonly ItemView[]>(() => this.views().filter(view => !view.active));

  protected readonly keyDates = computed<readonly DahcDetailItem[]>(() => {
    const item = this.activeView()?.item ?? this.items()[0];

    if (!item) {
      return [];
    }

    const dates: DahcDetailItem[] = [
      { label: $localize`:@@portal.dashboard.submissionDeadline:Submission deadline`, value: this.date(item.submissionDeadline) },
      { label: $localize`:@@portal.dashboard.scoreAnnouncement:Score announcement`, value: this.date(item.announcementDate) },
    ];

    if (item.appealDeadline) {
      dates.push({ label: $localize`:@@portal.dashboard.appealDeadline:Appeal deadline`, value: this.dateTime(item.appealDeadline) });
    }

    return dates;
  });

  protected readonly appealOpen = computed<boolean>(() => this.items().some(item => item.appealDeadline));

  protected readonly cycleTiles = computed<readonly CycleTile[]>(() => {
    const programs: readonly Program[] = this.programs.hasValue() ? this.programs.value() : [];
    const closes = programs
      .map(program => program.applicationClosesAt)
      .filter((value): value is string => typeof value === 'string')
      .sort()[0];
    const opens = programs.map(program => program.applicationOpensAt).find((value): value is string => typeof value === 'string');

    return [
      {
        icon: 'service-health-education',
        value: programs.length > 0 ? $localize`:@@portal.dashboard.programCount:${programs.length}:count: GME programs` : '—',
        caption: $localize`:@@portal.dashboard.academicEntity:Academic Entity`,
        tone: 'blue',
      },
      {
        icon: 'calendar',
        value: this.date(closes) || '—',
        caption: $localize`:@@portal.dashboard.creationDeadline:Application Creation Deadline`,
        tone: 'red',
      },
      {
        icon: 'recent',
        value: opens ? String(new Date(opens).getFullYear()) : '—',
        caption: $localize`:@@portal.dashboard.academicYear:Academic Year`,
        tone: 'green',
      },
    ];
  });

  protected readonly openDialog = signal<DialogKind | null>(null);
  protected readonly dialogItem = signal<ItemView | null>(null);

  constructor() {
    effect(() => {
      const minutes = this.data()?.sessionTimeoutMinutes;

      if (minutes) {
        this.inactivity.setTimeoutMinutes(minutes);
      }
    });
  }

  protected open(kind: DialogKind, view: ItemView): void {
    this.dialogItem.set(view);
    this.openDialog.set(kind);
  }

  protected isOpen(kind: DialogKind): boolean {
    return this.openDialog() === kind;
  }

  protected setOpen(kind: DialogKind, open: boolean): void {
    if (!open && this.openDialog() === kind) {
      this.openDialog.set(null);
    }
  }

  protected reload(): void {
    this.dashboard.reload();
  }

  private toView(item: CandidateDashboardItem, preferences: readonly PreferenceView[]): ItemView {
    const rules = programRules(item.program);
    const scores = item.announcedScores ?? null;
    const value = (score: number | null | undefined): string => (typeof score === 'number' ? this.numbers.format(score) : '');
    const tiles: ScoreTile[] = [
      { label: $localize`:@@portal.dashboard.portfolioScore:Portfolio final score`, value: value(scores?.finalPortfolioScore), color: 'orange' },
    ];

    if (rules.entranceExams.length > 0) {
      tiles.push({ label: $localize`:@@portal.dashboard.examScore:Entrance exam score`, value: value(scores?.examShortlistingScore), color: 'blue' });
    }

    if (rules.gpaWeight !== null) {
      tiles.push({ label: $localize`:@@portal.dashboard.gpaScore:GPA score`, value: value(scores?.gpaShortlistingScore), color: 'purple' });
    }

    tiles.push({ label: $localize`:@@portal.dashboard.shortlistingScore:Shortlisting score`, value: value(scores?.shortlistingScore), color: 'red' });

    const firstSpecialty = preferences[0]?.specialtyName;

    return {
      item,
      status: applicationStatusDisplay(item.status),
      programLine: firstSpecialty ? `${item.program.name} · ${firstSpecialty}` : item.program.name,
      details: [
        { label: $localize`:@@portal.dashboard.created:Created`, value: this.date(item.createdAt) },
        { label: $localize`:@@portal.dashboard.submitted:Submitted`, value: this.date(item.submittedAt) },
        { label: $localize`:@@portal.dashboard.announcement:Announcement`, value: this.date(item.announcementDate) },
      ],
      preferences,
      scores: tiles,
      actions: new Set(item.allowedActions),
      active: !INACTIVE.includes(item.status),
    };
  }

  private date(value: string | null | undefined): string {
    return formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), 'date');
  }

  private dateTime(value: string | null | undefined): string {
    return formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), 'dateTime');
  }
}
