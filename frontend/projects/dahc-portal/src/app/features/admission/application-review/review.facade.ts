import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AdmissionApiService, IcpRefreshReason, LookupType } from '../../../api/admission-api.service';
import {
  ApplicationAttachment,
  CorrectionFlag,
  IcpRefreshPreview,
  ScreenOutDecision,
  StaffApplication,
  VerificationFeedbackAction,
} from '../../../api/admission.models';
import { LookupItem } from '../../../api/candidate-lifecycle.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { ApiProblemDetails } from '../../../core/api/api.models';
import { SessionService } from '../../../core/auth/session.service';
import { VerificationAction, isAfterSupervisorFeedback, verificationActions } from '../../../shared/workflow/verification-actions';

/**
 * State and actions of the application review page (US-2.3.x, US-2.4.x, US-2.5.2, US-2.5.3).
 * Provided by the page, so its dialogs share it. Every action sends callerHandlesProblems(), so
 * the dialog shows the API's problem; on success the application is read again.
 */
@Injectable()
export class ReviewFacade {
  private readonly api = inject(AdmissionApiService);
  private readonly session = inject(SessionService).session;
  private readonly applicationIdState = signal<string>('');
  private readonly applicationState = signal<StaffApplication | null>(null);
  private readonly attachmentsState = signal<readonly ApplicationAttachment[]>([]);
  private readonly problemState = signal<ApiProblemDetails | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private readonly draftFlagsState = signal<readonly CorrectionFlag[]>([]);
  private readonly lookups = new Map<LookupType, Promise<readonly LookupItem[]>>();

  readonly application = this.applicationState.asReadonly();
  readonly attachments = this.attachmentsState.asReadonly();
  /** Why the application could not be read (shown instead of the page). */
  readonly problem = this.problemState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  /** Flags as edited on the page; saved with saveFlags() (US-2.3.2). */
  readonly draftFlags = this.draftFlagsState.asReadonly();

  readonly activeRole = computed<string>(() => this.session()?.activeRole ?? '');
  readonly review = computed(() => this.applicationState()?.review ?? null);
  readonly savedFlags = computed<readonly CorrectionFlag[]>(() => this.review()?.flags ?? []);
  readonly flagsDirty = computed<boolean>(() => !sameFlags(this.draftFlagsState(), this.savedFlags()));
  readonly flaggedPointers = computed<readonly string[]>(() => this.draftFlagsState().map(flag => flag.fieldPointer));
  readonly actions = computed<readonly VerificationAction[]>(() => {
    const review = this.review();

    return review ? verificationActions(review.verificationStatus, this.activeRole(), this.savedFlags().length > 0) : [];
  });
  /** After supervisor feedback the officer's actions go through verification-actions (US-2.4.5). */
  readonly afterFeedback = computed<boolean>(() => {
    const review = this.review();

    return review !== null && this.activeRole() === 'ADMISSION_OFFICER' && isAfterSupervisorFeedback(review.verificationStatus);
  });
  readonly latestGuidance = computed(() => [...(this.review()?.notes ?? [])].reverse().find(note => note.noteType === 'SUPERVISOR_GUIDANCE') ?? null);

  async load(applicationId: string): Promise<void> {
    this.applicationIdState.set(applicationId);
    this.loadingState.set(true);
    this.problemState.set(null);

    try {
      const [application, attachments] = await Promise.all([
        firstValueFrom(this.api.getApplication(applicationId, callerHandlesProblems())),
        firstValueFrom(this.api.listAttachments(applicationId, callerHandlesProblems())),
      ]);
      this.applicationState.set(application.data);
      this.attachmentsState.set(attachments.data);
      this.draftFlagsState.set(application.data.review?.flags ?? []);
    } catch (error: unknown) {
      this.applicationState.set(null);
      this.problemState.set(isApiProblemError(error) ? error.problem : null);
    } finally {
      this.loadingState.set(false);
    }
  }

  reload(): Promise<void> {
    return this.load(this.applicationIdState());
  }

  /** Drop-down values, read once per page. */
  lookup(type: LookupType): Promise<readonly LookupItem[]> {
    let items = this.lookups.get(type);

    if (!items) {
      items = firstValueFrom(this.api.listLookup(type)).then(result => result.data.filter(item => item.active));
      items.catch(() => this.lookups.delete(type));
      this.lookups.set(type, items);
    }

    return items;
  }

  flagFor(pointer: string): CorrectionFlag | null {
    return this.draftFlagsState().find(flag => flag.fieldPointer === pointer) ?? null;
  }

  setFlag(flag: CorrectionFlag): void {
    this.draftFlagsState.set([...this.draftFlagsState().filter(item => item.fieldPointer !== flag.fieldPointer), flag]);
  }

  removeFlag(pointer: string): void {
    this.draftFlagsState.set(this.draftFlagsState().filter(item => item.fieldPointer !== pointer));
  }

  discardFlagChanges(): void {
    this.draftFlagsState.set(this.savedFlags());
  }

  async saveFlags(): Promise<void> {
    await firstValueFrom(this.api.saveCorrectionFlags(this.id, { flags: this.draftFlagsState() }, callerHandlesProblems()));
    await this.reload();
  }

  // Officer (US-2.3.3, US-2.3.5, US-2.4.1, US-2.4.2, through verification-actions after feedback, US-2.4.5).

  async returnForCorrection(correctionDeadline: string, key: string): Promise<void> {
    await firstValueFrom(
      this.afterFeedback()
        ? this.feedback('RETURN_FOR_CORRECTION', key)
        : this.api.returnForCorrection(this.id, correctionDeadline, key, callerHandlesProblems()),
    );
  }

  async completeVerification(key: string): Promise<void> {
    await firstValueFrom(this.afterFeedback() ? this.feedback('COMPLETE_VERIFICATION', key) : this.api.completeVerification(this.id, key, callerHandlesProblems()));
  }

  async recommendScreenOut(reasonCode: string, note: string | null, key: string): Promise<void> {
    await firstValueFrom(
      this.afterFeedback()
        ? this.feedback('RECOMMEND_SCREEN_OUT', key, reasonCode, note ?? undefined)
        : this.api.recommendScreenOut(this.id, reasonCode, note, callerHandlesProblems()),
    );
  }

  async escalate(note: string, key: string): Promise<void> {
    await firstValueFrom(
      this.afterFeedback() ? this.feedback('ESCALATE_FOR_CLARIFICATION', key, undefined, note) : this.api.escalate(this.id, note, callerHandlesProblems()),
    );
  }

  /** US-2.3.6: a new version of the attachment; statuses do not change. */
  async replaceAttachment(attachmentId: string, file: File, reason: string): Promise<void> {
    await firstValueFrom(this.api.replaceAttachment(this.id, attachmentId, file, reason, callerHandlesProblems()));
    await this.reload();
  }

  // Supervisor (US-2.4.3, US-2.4.4, US-2.5.2, US-2.5.3).

  async decideScreenOut(decision: ScreenOutDecision, key: string): Promise<void> {
    await firstValueFrom(this.api.decideScreenOut(this.id, decision, key, callerHandlesProblems()));
  }

  async returnWithGuidance(note: string): Promise<void> {
    await firstValueFrom(this.api.returnWithGuidance(this.id, note, callerHandlesProblems()));
  }

  async reinstate(justification: string, key: string): Promise<void> {
    await firstValueFrom(this.api.reinstateScreenedOut(this.id, justification, key, callerHandlesProblems()));
  }

  async previewIcp(reason: IcpRefreshReason): Promise<IcpRefreshPreview> {
    const result = await firstValueFrom(this.api.previewIcpRefresh(this.candidateId, reason, callerHandlesProblems()));

    return result.data;
  }

  async applyIcp(reason: IcpRefreshReason, previewToken: string, fieldCodes: readonly string[]): Promise<void> {
    await firstValueFrom(this.api.applyIcpRefresh(this.candidateId, { requestReason: reason, previewToken, fieldCodes }, callerHandlesProblems()));
    await this.reload();
  }

  private feedback(action: VerificationFeedbackAction, key: string, reasonCode?: string, note?: string): ReturnType<AdmissionApiService['continueAfterFeedback']> {
    return this.api.continueAfterFeedback(
      this.id,
      { action, ...(reasonCode === undefined ? {} : { reasonCode }), ...(note === undefined ? {} : { note }) },
      key,
      callerHandlesProblems(),
    );
  }

  private get id(): string {
    return this.applicationIdState();
  }

  private get candidateId(): string {
    return this.review()?.candidateId ?? '';
  }
}

function sameFlags(first: readonly CorrectionFlag[], second: readonly CorrectionFlag[]): boolean {
  const key = (flags: readonly CorrectionFlag[]): string =>
    flags
      .map(flag => `${flag.fieldPointer}|${flag.candidateNoteCode}|${flag.candidateNote ?? ''}`)
      .sort()
      .join('\n');

  return key(first) === key(second);
}
