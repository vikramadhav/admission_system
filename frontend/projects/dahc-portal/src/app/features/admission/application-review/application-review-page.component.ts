import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcSpinnerComponent,
  DahcTimelineComponent,
  DahcTimelineItemComponent,
  DahcToastService,
} from 'dahc-ui';

import { ApplicationAttachment, StaffNote, StaffNoteType } from '../../../api/admission.models';
import { SessionService } from '../../../core/auth/session.service';
import { roleHome } from '../../../core/auth/roles';
import { DahcDateTimePipe } from '../../../core/locale/date-time.pipe';
import { DahcIfPermittedDirective } from '../../../core/permissions/if-permitted.directive';
import { StaffApplicationViewComponent, StaffFlagRequest } from '../../../shared/staff-application/staff-application-view.component';
import { VerificationAction } from '../../../shared/workflow/verification-actions';
import { CompleteVerificationDialogComponent } from './complete-verification-dialog.component';
import { FlagDialogComponent } from './flag-dialog.component';
import { IcpRefreshDialogComponent } from './icp-refresh-dialog.component';
import { NoteActionDialogComponent, NoteActionKind } from './note-action-dialog.component';
import { RecommendScreenOutDialogComponent } from './recommend-screen-out-dialog.component';
import { ReplaceAttachmentDialogComponent } from './replace-attachment-dialog.component';
import { ReturnForCorrectionDialogComponent } from './return-for-correction-dialog.component';
import { ReviewActionDone, problemText } from './review-support';
import { ReviewFacade } from './review.facade';
import { ScreenOutDecisionDialogComponent } from './screen-out-decision-dialog.component';

type OpenDialog = 'flag' | 'return' | 'complete' | 'screenOut' | 'note' | 'decision' | 'replace' | 'icp' | null;

/**
 * Application review for admission staff (US-2.3.1 to US-2.5.3). The officer verifies an
 * application retrieved from a pool: flags and notes, return for correction, complete
 * verification, replace attachments, recommend screen-out, escalate, and acts on supervisor
 * feedback. The supervisor decides screen-outs and escalations, reinstates screened-out
 * applications and refreshes ICP data. Buttons follow the verification status and active role
 * (shared/workflow/verification-actions.ts); the API decides every action.
 */
@Component({
  selector: 'dahc-application-review-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CompleteVerificationDialogComponent,
    DahcAlertComponent,
    DahcButtonComponent,
    DahcDateTimePipe,
    DahcIfPermittedDirective,
    DahcPageHeaderComponent,
    DahcSpinnerComponent,
    DahcTimelineComponent,
    DahcTimelineItemComponent,
    FlagDialogComponent,
    IcpRefreshDialogComponent,
    NoteActionDialogComponent,
    RecommendScreenOutDialogComponent,
    ReplaceAttachmentDialogComponent,
    ReturnForCorrectionDialogComponent,
    ScreenOutDecisionDialogComponent,
    StaffApplicationViewComponent,
  ],
  providers: [ReviewFacade],
  templateUrl: './application-review-page.component.html',
  styleUrl: './application-review-page.component.scss',
})
export class ApplicationReviewPageComponent {
  private readonly router = inject(Router);
  private readonly toasts = inject(DahcToastService);

  /** Route parameter. */
  readonly applicationId = input.required<string>();

  protected readonly facade = inject(ReviewFacade);
  protected readonly timeZoneId = inject(SessionService).timeZoneId;
  protected readonly dialog = signal<OpenDialog>(null);
  protected readonly flagTarget = signal<StaffFlagRequest | null>(null);
  protected readonly replaceTarget = signal<ApplicationAttachment | null>(null);
  protected readonly noteKind = signal<NoteActionKind>('escalate');
  protected readonly savingFlags = signal<boolean>(false);
  protected readonly flagsError = signal<string>('');

  protected readonly heading = computed<string>(() => {
    const number = this.facade.application()?.applicationNumber ?? '';

    return $localize`:@@portal.admission.review.heading:Application ${number}:number:`;
  });
  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [
    { label: this.homeLabel(), route: this.home() },
    { label: this.heading(), current: true },
  ]);
  protected readonly can = computed<ReadonlySet<VerificationAction>>(() => new Set(this.facade.actions()));
  protected readonly isOfficer = computed<boolean>(() => this.facade.activeRole() === 'ADMISSION_OFFICER');
  protected readonly isSupervisor = computed<boolean>(() => this.facade.activeRole() === 'ADMISSION_SUPERVISOR');
  protected readonly notes = computed<readonly StaffNote[]>(() => [...(this.facade.review()?.notes ?? [])].reverse());
  protected readonly latestEscalation = computed(() => this.notes().find(note => note.noteType === 'ESCALATION') ?? null);
  protected readonly status = computed(() => this.facade.review()?.verificationStatus ?? null);
  protected readonly problemMessage = computed<string>(() => {
    const problem = this.facade.problem();

    return problem?.detail ?? problem?.title ?? $localize`:@@portal.admission.review.loadFailed:The application could not be loaded.`;
  });

  constructor() {
    effect(() => {
      void this.facade.load(this.applicationId());
    });
  }

  protected openFlag(request: StaffFlagRequest): void {
    this.flagTarget.set(request);
    this.dialog.set('flag');
  }

  protected openReplace(attachment: ApplicationAttachment): void {
    this.replaceTarget.set(attachment);
    this.dialog.set('replace');
  }

  protected openNote(kind: NoteActionKind): void {
    this.noteKind.set(kind);
    this.dialog.set('note');
  }

  protected isOpen(name: Exclude<OpenDialog, null>): boolean {
    return this.dialog() === name;
  }

  protected setOpen(name: Exclude<OpenDialog, null>, open: boolean): void {
    if (open) {
      this.dialog.set(name);
    } else if (this.dialog() === name) {
      this.dialog.set(null);
    }
  }

  protected async saveFlags(): Promise<void> {
    this.savingFlags.set(true);
    this.flagsError.set('');

    try {
      await this.facade.saveFlags();
      this.toasts.show({ variant: 'success', heading: $localize`:@@portal.admission.review.flagsSaved:Flags saved.` });
    } catch (error: unknown) {
      this.flagsError.set(problemText(error));
    } finally {
      this.savingFlags.set(false);
    }
  }

  protected async done(result: ReviewActionDone): Promise<void> {
    this.toasts.show({ variant: 'success', heading: result.message });

    if (result.leave) {
      await this.router.navigateByUrl(this.home());
    } else {
      await this.facade.reload();
    }
  }

  protected noteHeading(type: StaffNoteType): string {
    switch (type) {
      case 'CORRECTION':
        return $localize`:@@portal.admission.review.note.correction:Correction request`;
      case 'ESCALATION':
        return $localize`:@@portal.admission.review.note.escalation:Escalation`;
      case 'SCREEN_OUT':
        return $localize`:@@portal.admission.review.note.screenOut:Screen-out recommendation`;
      case 'SUPERVISOR_GUIDANCE':
        return $localize`:@@portal.admission.review.note.guidance:Supervisor guidance`;
    }
  }

  private home(): string {
    return roleHome(this.facade.activeRole());
  }

  private homeLabel(): string {
    switch (this.facade.activeRole()) {
      case 'ADMISSION_OFFICER':
        return $localize`:@@portal.nav.officerDashboard:My applications`;
      case 'ADMISSION_SUPERVISOR':
        return $localize`:@@portal.nav.supervisorDashboard:Supervision`;
      default:
        return $localize`:@@portal.nav.siteMonitoring:Site monitoring`;
    }
  }
}
