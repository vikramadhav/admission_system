import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcSkeletonComponent,
  DahcTagComponent,
  DahcTimelineComponent,
  DahcTimelineItemComponent,
} from 'dahc-ui';
import { map } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { applicationStatusDisplay } from '../../../shared/application-status';
import { portfolioStatusDisplay, verificationStatusDisplay } from '../../../shared/workflow/workflow-status';
import { ReinstatementDecisionDialogComponent, ReinstatementDecisionKind } from './reinstatement-decision-dialog.component';
import { noteTypeLabel, reinstatementStatusDisplay, withdrawalReasonLabel } from './reinstatement-labels';

/**
 * One reinstatement request (US-2.5.1): the withdrawn application, the withdrawal reason, the
 * candidate's justification, the statuses before withdrawal and the staff notes. A pending
 * request can be approved or rejected (US-2.5.2); a decided one shows the decision.
 */
@Component({
  selector: 'dahc-reinstatement-request-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCardComponent,
    DahcDetailListComponent,
    DahcPageHeaderComponent,
    DahcSkeletonComponent,
    DahcTagComponent,
    DahcTimelineComponent,
    DahcTimelineItemComponent,
    ReinstatementDecisionDialogComponent,
  ],
  styleUrl: '../officer-dashboard/admission-pages.scss',
  template: `
    <dahc-page-header [heading]="heading()" [breadcrumbs]="breadcrumbs()" [focusOnLoad]="true" />
    <div class="dahc-portal-page">
      @if (request.error(); as error) {
        <dahc-alert variant="error" [announce]="true">{{ problemText(error) }}</dahc-alert>
      } @else if (request.hasValue()) {
        @let detail = request.value();
        <div class="toolbar">
          <dahc-tag [purpose]="status().purpose">{{ status().label }}</dahc-tag>
        </div>
        <dahc-detail-list
          i18n-heading="@@portal.admission.reinstatement.detailsHeading"
          heading="Request"
          [headingLevel]="2"
          [columns]="2"
          [items]="details()" />
        <dahc-card i18n-heading="@@portal.admission.reinstatement.justificationHeading" heading="Candidate's justification">
          <p class="dialog-text">{{ detail.justification }}</p>
        </dahc-card>
        <dahc-detail-list
          i18n-heading="@@portal.admission.reinstatement.previousHeading"
          heading="Status before withdrawal"
          [headingLevel]="2"
          [columns]="3"
          [items]="previous()" />
        <section class="section" aria-labelledby="reinstatement-notes">
          <h2 id="reinstatement-notes" class="section-heading" i18n="@@portal.admission.reinstatement.notesHeading">Staff notes</h2>
          @if (detail.notes.length === 0) {
            <p class="section-text" i18n="@@portal.admission.reinstatement.noNotes">No notes were recorded before the withdrawal.</p>
          } @else {
            <dahc-timeline i18n-label="@@portal.admission.reinstatement.notesHeading" label="Staff notes">
              @for (note of detail.notes; track note.createdAt + note.noteType) {
                <dahc-timeline-item [heading]="noteHeading(note.noteType, note.authorDisplayName)" [time]="date(note.createdAt)" [datetime]="note.createdAt">
                  {{ note.text }}
                </dahc-timeline-item>
              }
            </dahc-timeline>
          }
        </section>
        @if (detail.decision; as decision) {
          <dahc-detail-list
            i18n-heading="@@portal.admission.reinstatement.decisionHeading"
            heading="Decision"
            [headingLevel]="2"
            [columns]="2"
            [items]="decisionItems()" />
        } @else if (detail.status === 'SUBMITTED') {
          <div class="dahc-portal-actions">
            <button dahc-button type="button" (click)="openDialog('APPROVE')" i18n="@@portal.admission.reinstatement.approveButton">Approve reinstatement</button>
            <button dahc-button type="button" variant="danger-outline" (click)="openDialog('REJECT')" i18n="@@portal.admission.reinstatement.rejectButton">Reject reinstatement</button>
          </div>
        }
        <dahc-reinstatement-decision-dialog
          [(open)]="dialogOpen"
          [requestId]="requestId()"
          [applicationNumber]="detail.applicationNumber"
          [decision]="dialogDecision()"
          (completed)="request.reload()" />
      } @else {
        <dahc-skeleton />
      }
    </div>
  `,
})
export class ReinstatementRequestPageComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  /** Route parameter. */
  readonly requestId = input.required<string>();

  protected readonly dialogOpen = signal<boolean>(false);
  protected readonly dialogDecision = signal<ReinstatementDecisionKind>('APPROVE');

  protected readonly request = rxResource({
    params: () => this.requestId(),
    stream: ({ params }) => this.api.getReinstatementRequest(params).pipe(map(result => result.data)),
  });

  protected readonly heading = computed<string>(() =>
    this.request.hasValue()
      ? $localize`:@@portal.admission.reinstatement.heading:Reinstatement request for ${this.request.value().applicationNumber}:number:`
      : $localize`:@@portal.title.admission.reinstatementShort:Reinstatement request`,
  );
  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [
    { label: $localize`:@@portal.nav.supervisorDashboard:Supervision`, route: '/admission/supervisor' },
    { label: $localize`:@@portal.admission.reinstatement.queueHeading:Reinstatement requests`, route: '/admission/supervisor/reinstatements' },
    { label: this.request.hasValue() ? this.request.value().applicationNumber : '' },
  ]);
  protected readonly status = computed(() => reinstatementStatusDisplay(this.request.hasValue() ? this.request.value().status : 'SUBMITTED'));
  protected readonly details = computed<readonly DahcDetailItem[]>(() => {
    if (!this.request.hasValue()) {
      return [];
    }

    const detail = this.request.value();
    const reason = withdrawalReasonLabel(detail.withdrawalReasonCode);

    return [
      { label: $localize`:@@portal.admission.reinstatement.colApplication:Application ID`, value: detail.applicationNumber },
      { label: $localize`:@@portal.admission.reinstatement.colCandidate:Candidate name`, value: detail.candidateName },
      { label: $localize`:@@portal.admission.reinstatement.colProgram:Program`, value: detail.programName },
      { label: $localize`:@@portal.admission.reinstatement.colRequested:Requested`, value: this.date(detail.requestedAt) },
      { label: $localize`:@@portal.admission.reinstatement.withdrawnAt:Withdrawn`, value: this.date(detail.withdrawnAt) },
      {
        label: $localize`:@@portal.admission.reinstatement.withdrawalReason:Withdrawal reason`,
        value: detail.withdrawalOtherReason ? `${reason}: ${detail.withdrawalOtherReason}` : reason,
      },
    ];
  });
  protected readonly previous = computed<readonly DahcDetailItem[]>(() => {
    if (!this.request.hasValue()) {
      return [];
    }

    const previous = this.request.value().previousStatus;

    return [
      { label: $localize`:@@portal.admission.reinstatement.applicationStatus:Application status`, value: applicationStatusDisplay(previous.applicationStatus).label },
      {
        label: $localize`:@@portal.admission.reinstatement.verificationStatus:Verification status`,
        value: previous.verificationStatus ? verificationStatusDisplay(previous.verificationStatus).label : '',
      },
      {
        label: $localize`:@@portal.admission.reinstatement.portfolioStatus:Portfolio status`,
        value: previous.portfolioStatus ? portfolioStatusDisplay(previous.portfolioStatus).label : '',
      },
    ];
  });
  protected readonly decisionItems = computed<readonly DahcDetailItem[]>(() => {
    const decision = this.request.hasValue() ? this.request.value().decision : null;

    if (!decision) {
      return [];
    }

    return [
      {
        label: $localize`:@@portal.admission.reinstatement.decisionLabel:Decision`,
        value: decision.decision === 'APPROVE' ? reinstatementStatusDisplay('APPROVED').label : reinstatementStatusDisplay('REJECTED').label,
      },
      { label: $localize`:@@portal.admission.reinstatement.decidedAt:Decided`, value: this.date(decision.decidedAt) },
      { label: $localize`:@@portal.admission.reinstatement.decidedBy:Decided by`, value: decision.decidedByDisplayName ?? '' },
      ...(decision.reasonCode ? [{ label: $localize`:@@portal.admission.reinstatement.rejectReason:Reason for rejection`, value: decision.reasonCode }] : []),
      { label: $localize`:@@portal.admission.reinstatement.note:Note`, value: decision.note },
    ];
  });

  protected openDialog(decision: ReinstatementDecisionKind): void {
    this.dialogDecision.set(decision);
    this.dialogOpen.set(true);
  }

  protected noteHeading(type: Parameters<typeof noteTypeLabel>[0], author: string | undefined): string {
    return author ? `${noteTypeLabel(type)} – ${author}` : noteTypeLabel(type);
  }

  protected date(value: string): string {
    return formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), 'dateTime');
  }

  protected problemText(error: unknown): string {
    return isApiProblemError(error)
      ? (error.problem.detail ?? error.problem.title)
      : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`;
  }
}
