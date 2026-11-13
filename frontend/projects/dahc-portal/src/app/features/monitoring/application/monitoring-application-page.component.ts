import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DahcAlertComponent, DahcButtonComponent, DahcIconComponent, DahcNavLink, DahcPageHeaderComponent, DahcSkeletonComponent } from 'dahc-ui';
import { forkJoin, map } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { StaffApplicationViewComponent } from '../../../shared/staff-application/staff-application-view.component';

/**
 * Read-only application details for the central monitor (US-2.1.4): the shared staff application
 * view without any action (no flags, replacements or decisions). The admission supervisor reaches
 * it from /monitoring too (PQ-07).
 */
@Component({
  selector: 'dahc-monitoring-application-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcIconComponent, DahcPageHeaderComponent, DahcSkeletonComponent, StaffApplicationViewComponent],
  styleUrl: '../monitoring-pages.scss',
  template: `
    <dahc-page-header [heading]="heading()" [description]="description()" [breadcrumbs]="breadcrumbs()" [focusOnLoad]="true" />

    <div class="dahc-portal-page">
      @if (details.error(); as error) {
        <dahc-alert variant="error" [announce]="true" i18n-heading="@@portal.monitoring.application.loadFailed" heading="The application cannot be shown">
          {{ problemText(error) }}
        </dahc-alert>
      } @else if (details.hasValue()) {
        <dahc-staff-application-view [application]="details.value().application" [attachments]="details.value().attachments" />
      } @else {
        <dahc-skeleton />
      }
      <div class="actions">
        <button dahc-button type="button" variant="secondary" (click)="back()">
          <dahc-icon name="chevron-left" />
          <span i18n="@@portal.monitoring.application.back">Back to the list</span>
        </button>
      </div>
    </div>
  `,
})
export class MonitoringApplicationPageComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly location = inject(Location);

  /** Route parameter. */
  readonly applicationId = input.required<string>();

  protected readonly details = rxResource({
    params: () => this.applicationId(),
    stream: ({ params: id }) =>
      forkJoin({
        application: this.api.getApplication(id, callerHandlesProblems()).pipe(map(result => result.data)),
        attachments: this.api.listAttachments(id, callerHandlesProblems()).pipe(map(result => result.data)),
      }),
  });

  protected readonly heading = computed<string>(() => {
    const number = this.details.hasValue() ? this.details.value().application.applicationNumber : '';

    return number ? $localize`:@@portal.monitoring.application.heading:Application ${number}:number:` : $localize`:@@portal.monitoring.application.headingLoading:Application details`;
  });

  protected readonly description = computed<string>(() => $localize`:@@portal.monitoring.application.description:Read only. Site monitoring cannot change applications.`);

  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [
    { label: $localize`:@@portal.monitoring.dashboard.heading:Site monitoring`, route: '/monitoring' },
    { label: $localize`:@@portal.monitoring.applications.listHeading:Applications`, route: '/monitoring/applications' },
    { label: this.heading() },
  ]);

  protected problemText(error: unknown): string {
    return isApiProblemError(error)
      ? (error.problem.detail ?? error.problem.title)
      : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`;
  }

  protected back(): void {
    this.location.back();
  }
}
