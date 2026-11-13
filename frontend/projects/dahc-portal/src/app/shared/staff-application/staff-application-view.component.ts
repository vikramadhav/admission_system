import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import {
  DahcButtonComponent,
  DahcDetailItemComponent,
  DahcDetailListComponent,
  DahcTagComponent,
} from 'dahc-ui';

import { AdmissionApiService } from '../../api/admission-api.service';
import { ApplicationAttachment, StaffApplication } from '../../api/admission.models';
import { SessionService } from '../../core/auth/session.service';
import { openBlobInNewTab } from '../../core/api/file-download';
import { DahcDateTimePipe } from '../../core/locale/date-time.pipe';
import { portfolioStatusDisplay, verificationStatusDisplay, weightedScore } from '../workflow/workflow-status';
import {
  attachmentPointer,
  displayValue,
  fieldLabel,
  fieldPointer,
  isHiddenField,
  sectionLabel,
  sectionPointer,
} from './staff-application-labels';

/** A request to flag one item, raised by the Flag buttons (shown only when `flaggable`). */
export interface StaffFlagRequest {
  readonly pointer: string;
  readonly label: string;
}

interface FieldView {
  readonly code: string;
  readonly label: string;
  readonly value: string;
  readonly pointer: string;
  readonly fromIcp: boolean;
  readonly flagged: boolean;
}

interface SectionView {
  readonly key: string;
  readonly label: string;
  readonly pointer: string;
  readonly flagged: boolean;
  readonly fields: readonly FieldView[];
}

/**
 * Read-only view of an application for admission staff and the Central Monitor (US-2.3.1,
 * US-2.1.4): key facts, each section under its own heading (dahc-tabs cannot render panels created with @for), ICP-sourced fields marked "From ICP", and the
 * attachments with View. Training sites and the portfolio are never shown (STP-2.1). It knows
 * nothing about roles: the host page turns on `flaggable` and `replaceable` and handles the
 * requests.
 */
@Component({
  selector: 'dahc-staff-application-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcDateTimePipe,
    DahcDetailItemComponent,
    DahcDetailListComponent,
    DahcTagComponent,
  ],
  styles: `
    :host { display: grid; gap: var(--dahc-space-6); }
    .value { display: inline-flex; flex-wrap: wrap; align-items: center; gap: var(--dahc-space-2); }
    .section {
      display: grid; gap: var(--dahc-space-4);
      padding: var(--dahc-space-5);
      border: 1px solid var(--dahc-color-border-subtle); border-radius: var(--dahc-radius-md);
      background-color: var(--dahc-color-surface);
    }
    .section-tools { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--dahc-space-3); }
    .section-tools h3 { margin: 0; font-size: var(--dahc-type-heading-4-size); line-height: var(--dahc-type-heading-4-line-height); }
    .attachments { display: grid; gap: var(--dahc-space-3); margin: 0; padding: 0; list-style: none; }
    .attachment {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--dahc-space-3);
      padding: var(--dahc-space-3) var(--dahc-space-4);
      border: 1px solid var(--dahc-color-border-subtle); border-radius: var(--dahc-radius-md);
      background-color: var(--dahc-color-surface);
    }
    .attachment-text { display: grid; gap: var(--dahc-space-1); min-inline-size: 0; }
    .attachment-text strong { overflow-wrap: anywhere; }
    .attachment-meta { margin: 0; color: var(--dahc-color-text-secondary); font-size: var(--dahc-type-body-sm-size); line-height: var(--dahc-type-body-sm-line-height); overflow-wrap: anywhere; }
    .attachment-actions { display: flex; flex-wrap: wrap; gap: var(--dahc-space-2); }
    .empty { margin: 0; color: var(--dahc-color-text-secondary); }
  `,
  template: `
    <dahc-detail-list i18n-heading="@@portal.staffApplication.factsHeading" heading="Application summary" [headingLevel]="2" [bordered]="true">
      <div dahc-detail-item i18n-label="@@portal.staffApplication.applicationNumber" label="Application ID">{{ application().applicationNumber }}</div>
      <div dahc-detail-item i18n-label="@@portal.staffApplication.candidate" label="Candidate">{{ review()?.candidateName ?? '' }}</div>
      <div dahc-detail-item i18n-label="@@portal.staffApplication.program" label="Program">{{ application().program.name }}</div>
      <div dahc-detail-item i18n-label="@@portal.staffApplication.submitted" label="Submitted">
        {{ application().submittedAt | dahcDateTime: timeZoneId() : 'dateTime' }}
      </div>
      @if (verification(); as status) {
        <div dahc-detail-item i18n-label="@@portal.staffApplication.verificationStatus" label="Verification status">
          <dahc-tag [purpose]="status.purpose">{{ status.label }}</dahc-tag>
        </div>
      }
      @if (portfolio(); as status) {
        <div dahc-detail-item i18n-label="@@portal.staffApplication.portfolioStatus" label="Portfolio status">
          <dahc-tag [purpose]="status.purpose">{{ status.label }}</dahc-tag>
        </div>
      }
      <div dahc-detail-item i18n-label="@@portal.staffApplication.officer" label="Assigned officer">{{ review()?.assignedOfficerName || '–' }}</div>
      <div dahc-detail-item i18n-label="@@portal.staffApplication.dueDate" label="Due date">
        {{ (review()?.dueAt | dahcDateTime: timeZoneId()) || '–' }}
      </div>
      <div dahc-detail-item i18n-label="@@portal.staffApplication.gpaScore" label="GPA shortlisting score">{{ gpaScore() }}</div>
      @if (review()?.examShortlistingScore !== null && review()?.examShortlistingScore !== undefined) {
        <div dahc-detail-item i18n-label="@@portal.staffApplication.examScore" label="Exam shortlisting score">{{ examScore() }}</div>
      }
    </dahc-detail-list>

    @for (section of sections(); track section.key) {
        <section class="section" [attr.aria-labelledby]="'staff-section-' + section.key">
          <div class="section-tools">
            <h3 [id]="'staff-section-' + section.key">{{ section.label }}</h3>
            @if (section.flagged) {
              <dahc-tag purpose="warning" i18n="@@portal.staffApplication.flagged">Flagged</dahc-tag>
            }
            @if (flaggable()) {
              <button dahc-button type="button" variant="secondary" size="sm" (click)="flagRequested.emit({ pointer: section.pointer, label: section.label })">
                <ng-container i18n="@@portal.staffApplication.flagSection">Flag section</ng-container>
                <span class="dahc-visually-hidden">{{ section.label }}</span>
              </button>
            }
          </div>
          <dahc-detail-list [columns]="2">
            @for (field of section.fields; track field.code) {
              <div dahc-detail-item [label]="field.label">
                <span class="value">
                  <span>{{ field.value || '–' }}</span>
                  @if (field.fromIcp) {
                    <dahc-tag purpose="informative-blue" i18n="@@portal.staffApplication.fromIcp">From ICP</dahc-tag>
                  }
                  @if (field.flagged) {
                    <dahc-tag purpose="warning" i18n="@@portal.staffApplication.flagged">Flagged</dahc-tag>
                  }
                  @if (flaggable()) {
                    <button dahc-button type="button" variant="link" size="sm" (click)="flagRequested.emit({ pointer: field.pointer, label: field.label })">
                      <ng-container i18n="@@portal.staffApplication.flag">Flag</ng-container>
                      <span class="dahc-visually-hidden">{{ field.label }}</span>
                    </button>
                  }
                </span>
              </div>
            }
          </dahc-detail-list>
        </section>
      }
      <section class="section" aria-labelledby="staff-section-attachments">
        <div class="section-tools">
          <h3 id="staff-section-attachments" i18n="@@portal.staffApplication.attachmentsHeading">Attachments</h3>
        </div>
        @if (attachments().length === 0) {
          <p class="empty" i18n="@@portal.staffApplication.noAttachments">There are no attachments.</p>
        } @else {
          <ul class="attachments">
            @for (item of attachments(); track item.attachment.attachmentId) {
              <li class="attachment">
                <div class="attachment-text">
                  <strong>{{ item.label }}</strong>
                  <p class="attachment-meta">
                    {{ item.attachment.fileName }} ·
                    <ng-container i18n="@@portal.staffApplication.version">Version {{ item.attachment.version }}</ng-container>
                    @if (item.previousVersionCount > 0) {
                      ·
                      <ng-container i18n="@@portal.staffApplication.replaced">{item.previousVersionCount, plural, =1 {1 earlier version kept} other {{{ item.previousVersionCount }} earlier versions kept}}</ng-container>
                    }
                  </p>
                  @if (isFlagged(item)) {
                    <span><dahc-tag purpose="warning" i18n="@@portal.staffApplication.flagged">Flagged</dahc-tag></span>
                  }
                </div>
                <div class="attachment-actions">
                  <button dahc-button type="button" variant="secondary" size="sm" [loading]="opening() === item.attachment.attachmentId" (click)="view(item)">
                    <ng-container i18n="@@portal.staffApplication.view">View</ng-container>
                    <span class="dahc-visually-hidden">{{ item.label }}</span>
                  </button>
                  @if (replaceable()) {
                    <button dahc-button type="button" variant="secondary" size="sm" (click)="replaceRequested.emit(item)">
                      <ng-container i18n="@@portal.staffApplication.replace">Replace</ng-container>
                      <span class="dahc-visually-hidden">{{ item.label }}</span>
                    </button>
                  }
                  @if (flaggable()) {
                    <button dahc-button type="button" variant="link" size="sm" (click)="flagAttachment(item)">
                      <ng-container i18n="@@portal.staffApplication.flag">Flag</ng-container>
                      <span class="dahc-visually-hidden">{{ item.label }}</span>
                    </button>
                  }
                </div>
              </li>
            }
          </ul>
        }
      </section>
  `,
})
export class StaffApplicationViewComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly document = inject(DOCUMENT);

  readonly application = input.required<StaffApplication>();
  readonly attachments = input<readonly ApplicationAttachment[]>([]);
  /** Shows Flag buttons on sections, fields and attachments. */
  readonly flaggable = input<boolean>(false);
  /** Shows Replace on attachments. */
  readonly replaceable = input<boolean>(false);
  /** Pointers currently flagged (saved or not yet saved), marked "Flagged". */
  readonly flaggedPointers = input<readonly string[]>([]);
  readonly flagRequested = output<StaffFlagRequest>();
  readonly replaceRequested = output<ApplicationAttachment>();

  protected readonly timeZoneId = inject(SessionService).timeZoneId;
  protected readonly opening = signal<string | null>(null);

  protected readonly review = computed(() => this.application().review ?? null);
  protected readonly verification = computed(() => {
    const status = this.review()?.verificationStatus;

    return status ? verificationStatusDisplay(status) : null;
  });
  protected readonly portfolio = computed(() => {
    const status = this.review()?.portfolioStatus;

    return status ? portfolioStatusDisplay(status) : null;
  });
  protected readonly gpaScore = computed<string>(() => weightedScore(this.review()?.gpaShortlistingScore));
  protected readonly examScore = computed<string>(() => weightedScore(this.review()?.examShortlistingScore));

  protected readonly sections = computed<readonly SectionView[]>(() => {
    const flagged = new Set(this.flaggedPointers());
    const icp = new Set(this.review()?.icpFieldPointers ?? []);

    return Object.entries(this.application().sections ?? {}).map(([key, values]) => ({
      key,
      label: sectionLabel(key),
      pointer: sectionPointer(key),
      flagged: flagged.has(sectionPointer(key)),
      fields: Object.entries(values)
        .filter(([code]) => !isHiddenField(code))
        .map(([code, value]) => {
          const pointer = fieldPointer(key, code);

          return { code, label: fieldLabel(code), value: displayValue(value), pointer, fromIcp: icp.has(pointer), flagged: flagged.has(pointer) };
        }),
    }));
  });

  protected isFlagged(item: ApplicationAttachment): boolean {
    return this.flaggedPointers().includes(attachmentPointer(item.documentTypeCode));
  }

  protected flagAttachment(item: ApplicationAttachment): void {
    this.flagRequested.emit({ pointer: attachmentPointer(item.documentTypeCode), label: item.label });
  }

  protected async view(item: ApplicationAttachment): Promise<void> {
    this.opening.set(item.attachment.attachmentId);

    try {
      await openBlobInNewTab(this.document.defaultView, this.api.downloadAttachment(this.application().id, item.attachment.attachmentId));
    } finally {
      this.opening.set(null);
    }
  }
}
