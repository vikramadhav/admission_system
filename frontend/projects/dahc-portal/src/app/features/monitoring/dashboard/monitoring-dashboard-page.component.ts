import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DahcAlertComponent, DahcButtonComponent, DahcCardComponent, DahcPageHeaderComponent, DahcSelectComponent, DahcSelectOption, DahcStatTileComponent } from 'dahc-ui';
import { Subscription, combineLatest, startWith } from 'rxjs';

import { ApplicationStatus } from '../../../api/application.models';
import { MonitoringApiService } from '../../../api/monitoring-api.service';
import { MonitoringFilters, SiteMonitoringDashboard } from '../../../api/monitoring.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { ApiProblemDetails } from '../../../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../../../core/config/portal-config';
import { applicationStatusDisplay } from '../../../shared/application-status';
import { ChartDatum } from '../../../shared/charts/chart.models';
import { PieChartComponent } from '../../../shared/charts/pie-chart.component';
import { StackedBarChartComponent } from '../../../shared/charts/stacked-bar-chart.component';
import { InsightTile, poolTiles } from '../../../shared/workflow/pool-insights';

/** BRD US-2.1.4: one pie per status, in this order. */
const STATUS_ORDER: readonly ApplicationStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CORRECTION_REQUIRED', 'CORRECTION_SUBMITTED', 'REVIEW_COMPLETED', 'SCREENED_OUT'];

interface PieGroup {
  readonly id: string;
  readonly caption: string;
  readonly data: readonly ChartDatum[];
  /** Query parameter of the drill-down (applicationStatus or programId). */
  readonly param: 'applicationStatus' | 'programId';
}

const EMPTY_INSIGHTS = { submitted: 0, underVerification: 0, pendingWithCandidate: 0, screenedOut: 0, completed: 0 };

/**
 * Central Monitoring Dashboard (US-2.1.4) for the central monitor and the admission supervisor
 * (PQ-07). Read-only: all-pools insights, training site interest by specialty (stacked columns),
 * site applications by status and by program (one donut each). Filters (cycle, program, site)
 * refresh every component; any chart segment drills down to the applications behind it.
 */
@Component({
  selector: 'dahc-monitoring-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCardComponent,
    DahcPageHeaderComponent,
    DahcSelectComponent,
    DahcStatTileComponent,
    PieChartComponent,
    ReactiveFormsModule,
    StackedBarChartComponent,
  ],
  styleUrl: '../monitoring-pages.scss',
  template: `
    <dahc-page-header
      i18n-heading="@@portal.monitoring.dashboard.heading"
      heading="Site monitoring"
      i18n-description="@@portal.monitoring.dashboard.description"
      description="Application volumes and progress across training sites and programs."
      [focusOnLoad]="true" />

    <div class="dahc-portal-page">
      <section class="section" aria-labelledby="monitoring-filters">
        <h2 id="monitoring-filters" class="section-heading" i18n="@@portal.monitoring.dashboard.filtersHeading">Filters</h2>
        <div class="toolbar">
          @if (cycleOptions.length > 0) {
            <dahc-select
              [formControl]="cycle"
              i18n-label="@@portal.monitoring.dashboard.cycleFilter"
              label="Admission cycle"
              i18n-placeholder="@@portal.monitoring.dashboard.allCycles"
              placeholder="All cycles"
              [options]="cycleOptions" />
          }
          <dahc-select
            [formControl]="program"
            i18n-label="@@portal.monitoring.dashboard.programFilter"
            label="Program"
            i18n-placeholder="@@portal.monitoring.dashboard.allPrograms"
            placeholder="All programs"
            [options]="programOptions()" />
          <dahc-select
            [formControl]="site"
            i18n-label="@@portal.monitoring.dashboard.siteFilter"
            label="Training site"
            i18n-placeholder="@@portal.monitoring.dashboard.allSites"
            placeholder="All sites"
            [options]="siteOptions()" />
        </div>
      </section>

      @if (problem(); as problem) {
        <dahc-alert variant="error" [announce]="true">
          {{ problem.detail ?? problem.title }}
          <button dahc-button type="button" variant="link" (click)="load()" i18n="@@portal.action.tryAgain">Try again</button>
        </dahc-alert>
      }

      <section class="section" aria-labelledby="monitoring-pools">
        <h2 id="monitoring-pools" class="section-heading" i18n="@@portal.monitoring.dashboard.poolsHeading">All pools</h2>
        <ul class="tiles">
          @for (tile of tiles(); track tile.label) {
            <li><dahc-stat-tile [label]="tile.label" [value]="tile.value" [color]="tile.color" /></li>
          }
        </ul>
        <p class="section-text" i18n="@@portal.monitoring.dashboard.totalsNote">
          Site charts count an application once for each training site it selected, so their totals are not expected to match the pool counts.
        </p>
      </section>

      <section class="section" aria-labelledby="monitoring-interest">
        <h2 id="monitoring-interest" class="section-heading" i18n="@@portal.monitoring.dashboard.interestHeading">Training site interest by specialty</h2>
        <dahc-card class="chart-card">
          <dahc-stacked-bar-chart
            i18n-caption="@@portal.monitoring.dashboard.interestCaption"
            caption="Site selections by training site and specialty"
            [data]="interestData()"
            i18n-categoryTitle="@@portal.monitoring.dashboard.colSite"
            categoryTitle="Training site"
            i18n-seriesTitle="@@portal.monitoring.dashboard.colSpecialty"
            seriesTitle="Specialty"
            i18n-valueTitle="@@portal.monitoring.dashboard.colSelections"
            valueTitle="Selections"
            i18n-unit="@@portal.monitoring.dashboard.unitSelections"
            unit="selections"
            (segmentSelected)="drillDownInterest($event)" />
        </dahc-card>
      </section>

      <section class="section" aria-labelledby="monitoring-status">
        <h2 id="monitoring-status" class="section-heading" i18n="@@portal.monitoring.dashboard.statusHeading">Site applications by status</h2>
        <div class="chart-grid">
          @for (group of statusGroups(); track group.id) {
            <dahc-card class="chart-card">
              <dahc-pie-chart
                [caption]="group.caption"
                [data]="group.data"
                i18n-categoryTitle="@@portal.monitoring.dashboard.colStatus"
                categoryTitle="Application status"
                i18n-seriesTitle="@@portal.monitoring.dashboard.colSite"
                seriesTitle="Training site"
                i18n-valueTitle="@@portal.monitoring.dashboard.colApplications"
                valueTitle="Applications"
                i18n-unit="@@portal.monitoring.dashboard.unitApplications"
                unit="applications"
                i18n-emptyText="@@portal.monitoring.dashboard.noApplications"
                emptyText="0 applications"
                (segmentSelected)="drillDown(group, $event)" />
            </dahc-card>
          }
        </div>
      </section>

      <section class="section" aria-labelledby="monitoring-program">
        <h2 id="monitoring-program" class="section-heading" i18n="@@portal.monitoring.dashboard.programHeading">Site applications by program</h2>
        <div class="chart-grid">
          @for (group of programGroups(); track group.id) {
            <dahc-card class="chart-card">
              <dahc-pie-chart
                [caption]="group.caption"
                [data]="group.data"
                i18n-categoryTitle="@@portal.monitoring.dashboard.colProgram"
                categoryTitle="Program"
                i18n-seriesTitle="@@portal.monitoring.dashboard.colSite"
                seriesTitle="Training site"
                i18n-valueTitle="@@portal.monitoring.dashboard.colApplications"
                valueTitle="Applications"
                i18n-unit="@@portal.monitoring.dashboard.unitApplications"
                unit="applications"
                i18n-emptyText="@@portal.monitoring.dashboard.noApplications"
                emptyText="0 applications"
                (segmentSelected)="drillDown(group, $event)" />
            </dahc-card>
          } @empty {
            <p class="section-text" i18n="@@portal.monitoring.dashboard.noPrograms">No applications for the selected filters.</p>
          }
        </div>
      </section>
    </div>
  `,
})
export class MonitoringDashboardPageComponent {
  private readonly api = inject(MonitoringApiService);
  private readonly router = inject(Router);
  private readonly cycleId = inject(DAHC_PORTAL_CONFIG).admissionCycleId ?? null;
  private subscription: Subscription | null = null;

  protected readonly cycle = new FormControl<string>(this.cycleId ?? '', { nonNullable: true });
  protected readonly program = new FormControl<string>('', { nonNullable: true });
  protected readonly site = new FormControl<string>('', { nonNullable: true });

  /** The contract has no cycle list (OQ-24): the configured current cycle is the only choice. */
  protected readonly cycleOptions: readonly DahcSelectOption[] = this.cycleId
    ? [{ value: this.cycleId, label: $localize`:@@portal.monitoring.dashboard.currentCycle:Current cycle` }]
    : [];

  protected readonly dashboard = signal<SiteMonitoringDashboard | null>(null);
  protected readonly problem = signal<ApiProblemDetails | null>(null);

  /** Program and site choices come from the unfiltered dashboard: the contract has no site list without a specialty (OQ-19). */
  private readonly programs = signal<readonly DahcSelectOption[]>([]);
  private readonly sites = signal<readonly DahcSelectOption[]>([]);
  protected readonly programOptions = this.programs.asReadonly();
  protected readonly siteOptions = this.sites.asReadonly();

  /** The active filters: cycle, program, site ('' when not set). */
  private readonly filters = signal<readonly [string, string, string]>([this.cycle.value, '', '']);

  protected readonly tiles = computed<readonly InsightTile[]>(() => poolTiles(this.dashboard()?.poolInsights ?? EMPTY_INSIGHTS));

  protected readonly interestData = computed<readonly ChartDatum[]>(() =>
    (this.dashboard()?.siteInterestBySpecialty ?? []).map(item => ({
      categoryId: item.siteId,
      categoryLabel: item.siteName,
      seriesId: item.specialtyId,
      seriesLabel: item.specialtyName,
      value: item.selectionCount,
    })),
  );

  protected readonly statusGroups = computed<readonly PieGroup[]>(() => {
    const rows = this.dashboard()?.siteApplicationsByStatus ?? [];

    return STATUS_ORDER.map(status => ({
      id: status,
      caption: applicationStatusDisplay(status).label,
      param: 'applicationStatus' as const,
      data: rows
        .filter(row => row.applicationStatus === status)
        .map(row => ({ categoryId: status, categoryLabel: applicationStatusDisplay(status).label, seriesId: row.siteId, seriesLabel: row.siteName, value: row.applicationCount })),
    }));
  });

  protected readonly programGroups = computed<readonly PieGroup[]>(() => {
    const rows = this.dashboard()?.siteApplicationsByProgram ?? [];
    const programs = new Map<string, string>(rows.map(row => [row.programId, row.programName]));

    return [...programs.entries()].map(([programId, programName]) => ({
      id: programId,
      caption: programName,
      param: 'programId' as const,
      data: rows
        .filter(row => row.programId === programId)
        .map(row => ({ categoryId: programId, categoryLabel: programName, seriesId: row.siteId, seriesLabel: row.siteName, value: row.applicationCount })),
    }));
  });

  constructor() {
    combineLatest([this.cycle.valueChanges.pipe(startWith(this.cycle.value)), this.program.valueChanges.pipe(startWith('')), this.site.valueChanges.pipe(startWith(''))])
      .pipe(takeUntilDestroyed())
      .subscribe(filters => {
        this.filters.set(filters);
        this.load();
      });
    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  protected load(): void {
    const [cycleId, programId, siteId] = this.filters();
    const query: MonitoringFilters = { cycleId: cycleId || null, programId: programId || null, siteId: siteId || null };

    this.subscription?.unsubscribe();
    this.problem.set(null);
    this.subscription = this.api.getDashboard(query, callerHandlesProblems()).subscribe({
      next: result => {
        this.dashboard.set(result.data);

        if (!programId && !siteId) {
          this.rememberChoices(result.data);
        }
      },
      error: (error: unknown) => this.problem.set(isApiProblemError(error) ? error.problem : null),
    });
  }

  protected drillDownInterest(datum: ChartDatum): void {
    void this.router.navigate(['/monitoring/applications'], {
      queryParams: { ...this.activeFilters(), siteId: datum.categoryId, specialtyId: datum.seriesId, label: `${datum.categoryLabel} · ${datum.seriesLabel}` },
    });
  }

  protected drillDown(group: PieGroup, datum: ChartDatum): void {
    void this.router.navigate(['/monitoring/applications'], {
      queryParams: { ...this.activeFilters(), siteId: datum.seriesId, [group.param]: datum.categoryId, label: `${datum.seriesLabel} · ${datum.categoryLabel}` },
    });
  }

  private activeFilters(): Record<string, string> {
    const [cycleId, programId, siteId] = this.filters();
    const result: Record<string, string> = {};

    if (cycleId) {
      result['cycleId'] = cycleId;
    }

    if (programId) {
      result['programId'] = programId;
    }

    if (siteId) {
      result['siteId'] = siteId;
    }

    return result;
  }

  private rememberChoices(dashboard: SiteMonitoringDashboard): void {
    const programs = new Map<string, string>(dashboard.siteApplicationsByProgram.map(row => [row.programId, row.programName]));
    const sites = new Map<string, string>([...dashboard.siteInterestBySpecialty, ...dashboard.siteApplicationsByProgram].map(row => [row.siteId, row.siteName]));
    this.programs.set([...programs.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label)));
    this.sites.set([...sites.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label)));
  }
}
