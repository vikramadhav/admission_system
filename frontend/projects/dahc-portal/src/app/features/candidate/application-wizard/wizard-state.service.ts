import { HttpContext } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DahcToastService, DahcWizardStep, DahcWizardStepStatus } from 'dahc-ui';
import { Observable, catchError, debounceTime, filter, firstValueFrom, forkJoin, map, merge, of } from 'rxjs';

import { Application } from '../../../api/application.models';
import { ApplicationsApiService } from '../../../api/applications-api.service';
import { AttachmentsApiService } from '../../../api/attachments-api.service';
import { CandidateActionsApiService } from '../../../api/candidate-actions-api.service';
import {
  ApplicationSection,
  ApplicationSectionKey,
  AttachmentSectionKey,
  AttachmentSlot,
  PortfolioSubmission,
  SectionFieldState,
  SectionValues,
} from '../../../api/candidate-lifecycle.models';
import { Program } from '../../../api/catalog.models';
import { ApiProblemError, isApiProblemError } from '../../../core/api/api-problem-error';
import { DAHC_CALLER_HANDLES_PROBLEMS } from '../../../core/api/api-request';
import { ApiProblemDetails } from '../../../core/api/api.models';
import {
  PERSONAL_SUBSTEPS,
  ProgramRules,
  WizardGroupId,
  WizardStepId,
  groupLabel,
  programRules,
  stepGroup,
  stepLabel,
  wizardSteps,
} from '../../../shared/program-rules';
import { SECTION_DEFINITIONS } from './section-registry';
import { ProgramForm, createProgramForm, patchProgramForm, programPreferences } from './steps/program/program.form';
import { SectionFormDefinition, WizardContext, WizardMode, WizardPrimaryAction } from './wizard-model';

/** Pause after the last change before a section is saved silently. */
const AUTO_SAVE_DELAY_MS = 1500;

const CALLER_HANDLES = (): HttpContext => new HttpContext().set(DAHC_CALLER_HANDLES_PROBLEMS, true);

/** Personal sub-step → the group of the personal-information form it edits. */
const PERSONAL_GROUPS: Partial<Record<WizardStepId, string>> = {
  'personal-identity': 'identity',
  'personal-contact': 'contact',
  'personal-next-of-kin': 'nextOfKin',
};

/** The contract section a wizard page edits (program edits preferences; portfolio and pay have their own operations). */
export function stepSection(step: WizardStepId): ApplicationSectionKey | null {
  if (PERSONAL_SUBSTEPS.includes(step)) {
    return 'personal-information';
  }

  switch (step) {
    case 'program':
    case 'portfolio':
    case 'pay-and-submit':
      return null;
    default:
      return step as ApplicationSectionKey;
  }
}

/** The attachment slots shown on a wizard page. Personal attachments have their own sub-step. */
export function stepAttachmentSection(step: WizardStepId): AttachmentSectionKey | null {
  if (step === 'personal-attachments') {
    return 'personal-information';
  }

  if (PERSONAL_SUBSTEPS.includes(step) || step === 'program' || step === 'pay-and-submit') {
    return null;
  }

  return step === 'portfolio' ? 'portfolio' : (step as ApplicationSectionKey);
}

/**
 * State of one application in the wizard: the application and its ETag, the program rules, one
 * typed form per applicable section, attachment slots and the portfolio. Provided by the wizard
 * page, so it lives while the candidate moves between steps of the same application.
 */
@Injectable()
export class WizardStateService {
  private readonly applicationsApi = inject(ApplicationsApiService);
  private readonly attachmentsApi = inject(AttachmentsApiService);
  private readonly actionsApi = inject(CandidateActionsApiService);
  private readonly router = inject(Router);
  private readonly toasts = inject(DahcToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly applicationState = signal<Application | null>(null);
  private readonly selectedProgram = signal<Program | null>(null);
  private readonly sectionStates = signal<Partial<Record<ApplicationSectionKey, ApplicationSection>>>({});
  private readonly sectionEtags = new Map<ApplicationSectionKey, string>();
  private readonly slotState = signal<readonly AttachmentSlot[]>([]);
  private readonly portfolioState = signal<PortfolioSubmission | null>(null);
  private readonly retained = new Map<string, unknown>();
  private applicationEtag = '';

  readonly mode = signal<WizardMode>('create');
  readonly loading = signal<boolean>(false);
  readonly loadError = signal<ApiProblemDetails | null>(null);
  readonly saving = signal<boolean>(false);
  readonly saveProblem = signal<ApiProblemDetails | null>(null);
  readonly savedAt = signal<string | null>(null);
  readonly currentStep = signal<WizardStepId>('program');
  readonly visited = signal<ReadonlySet<WizardStepId>>(new Set());
  /** Steps whose errors are shown in full (after Next, Save or the pay check). */
  readonly checked = signal<ReadonlySet<WizardStepId>>(new Set());
  /** Bumped on every form change so validity-based signals recompute. */
  readonly revision = signal<number>(0);
  readonly primaryAction = signal<WizardPrimaryAction | null>(null);

  readonly programForm: ProgramForm = createProgramForm();
  readonly forms = Object.fromEntries(
    (Object.keys(SECTION_DEFINITIONS) as ApplicationSectionKey[]).map(key => [key, SECTION_DEFINITIONS[key].create()]),
  ) as Record<ApplicationSectionKey, FormGroup>;

  readonly application = this.applicationState.asReadonly();
  readonly slots = this.slotState.asReadonly();
  readonly portfolio = this.portfolioState.asReadonly();
  readonly program = computed<Program | null>(() => this.applicationState()?.program ?? this.selectedProgram());
  readonly rules = computed<ProgramRules | null>(() => {
    const program = this.program();

    return program ? programRules(program) : null;
  });
  readonly editable = computed<boolean>(() => this.mode() !== 'view');

  /** Pages of this application in order; before a program is chosen only the program page. */
  readonly steps = computed<readonly WizardStepId[]>(() => {
    const rules = this.rules();

    return rules && this.mode() !== 'create' ? wizardSteps(rules) : ['program'];
  });

  readonly stepIndex = computed<number>(() => Math.max(0, this.steps().indexOf(this.currentStep())));
  readonly previousStep = computed<WizardStepId | null>(() => this.steps()[this.stepIndex() - 1] ?? null);
  readonly nextStep = computed<WizardStepId | null>(() => this.steps()[this.stepIndex() + 1] ?? null);

  /** Stepper groups: "STEP n OF m" counts groups, as in Figma. */
  readonly groups = computed<readonly WizardGroupId[]>(() => {
    const rules = this.rules();

    return rules ? rules.groups : ['program'];
  });
  readonly groupIndex = computed<number>(() => this.groups().indexOf(stepGroup(this.currentStep())));

  readonly stepperSteps = computed<readonly DahcWizardStep[]>(() => {
    this.revision();
    const current = this.currentStep();
    const currentGroup = stepGroup(current);
    const steps = this.steps();

    return this.groups().map(group => {
      const pages = steps.filter(step => stepGroup(step) === group);
      const status: DahcWizardStepStatus =
        group === currentGroup ? 'current' : this.groupStatus(pages.length > 0 ? pages : [group as WizardStepId]);

      return {
        id: group,
        label: groupLabel(group),
        status,
        substeps:
          group === 'personal-information'
            ? PERSONAL_SUBSTEPS.map(step => ({
                id: step,
                label: stepLabel(step),
                status: step === current ? ('current' as const) : this.pageStatus(step),
              }))
            : [],
      };
    });
  });

  constructor() {
    // Keep conditional rules and validity-driven signals current as the candidate types.
    const changes = [this.programForm, ...Object.values(this.forms)].map(form => form.valueChanges);
    merge(...changes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.syncAll();
        this.revision.update(value => value + 1);
      });

    // Silent auto-save of a changed section (US-1.3.11). It also lets the server add the
    // document slots that depend on the new answers (for example the employment letter).
    for (const key of Object.keys(this.forms) as ApplicationSectionKey[]) {
      this.forms[key].valueChanges
        .pipe(
          debounceTime(AUTO_SAVE_DELAY_MS),
          filter(() => this.mode() === 'edit' && this.forms[key].dirty),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          const application = this.applicationState();

          if (application && this.sectionStates()[key] !== undefined) {
            void this.saveSection(application, key, true);
          }
        });
    }
  }

  // Loading.

  /** Create mode: no application yet, only the program page. */
  startNew(): void {
    this.mode.set('create');
    this.applicationState.set(null);
    this.programForm.reset();
    this.programForm.enable({ emitEvent: false });
    this.currentStep.set('program');
  }

  selectProgram(program: Program | null): void {
    this.selectedProgram.set(program);
  }

  async load(applicationId: string): Promise<void> {
    if (this.applicationState()?.id === applicationId) {
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);

    try {
      const result = await firstValueFrom(this.applicationsApi.getApplication(applicationId));
      const application = result.data;
      const rules = programRules(application.program);
      this.applicationEtag = result.etag ?? '';
      this.applicationState.set(application);
      this.mode.set(application.status === 'DRAFT' ? 'edit' : 'view');

      const keys = this.applicableSections(rules);
      const [sections, slots, portfolio] = await firstValueFrom(
        forkJoin([
          forkJoin(keys.map(key => this.fetchSection(application.id, key))),
          this.attachmentsApi.listSlots(application.id).pipe(map(slotResult => slotResult.data)),
          this.actionsApi.getPortfolio(application.id).pipe(
            map(portfolioResult => portfolioResult.data),
            catchError(() => of(null)),
          ),
        ]),
      );

      patchProgramForm(this.programForm, application.program.id, application.preferences);
      this.programForm.controls.programId.disable({ emitEvent: false });
      const states: Partial<Record<ApplicationSectionKey, ApplicationSection>> = {};

      keys.forEach((key, index) => {
        const section = sections[index];
        const form = this.forms[key];
        form.reset(undefined, { emitEvent: false });

        if (section) {
          states[key] = section.section;
          this.sectionEtags.set(key, section.etag);
          SECTION_DEFINITIONS[key].patch(form, section.section.values, section.section.fields);
          this.applyReadOnly(form, section.section.fields);
        }

        form.markAsPristine();
      });

      this.sectionStates.set(states);
      this.slotState.set(slots);
      this.portfolioState.set(portfolio);
      this.syncAll();

      if (this.mode() === 'view') {
        this.programForm.disable({ emitEvent: false });
        Object.values(this.forms).forEach(form => form.disable({ emitEvent: false }));
      }

      this.revision.update(value => value + 1);
    } catch (error: unknown) {
      this.loadError.set(isApiProblemError(error) ? error.problem : null);
      this.applicationState.set(null);

      if (!isApiProblemError(error)) {
        throw error;
      }
    } finally {
      this.loading.set(false);
    }
  }

  /** Re-reads the application, for example after another tab changed it (412). */
  async reload(): Promise<void> {
    const id = this.applicationState()?.id;

    if (id) {
      this.applicationState.set(null);
      this.saveProblem.set(null);
      await this.load(id);
    }
  }

  // Context for section forms.

  private wizardContext(): WizardContext | null {
    const rules = this.rules();

    return rules
      ? {
          rules,
          preferences: programPreferences(this.programForm, rules.maxPreferences),
          sectionValues: (key: ApplicationSectionKey): SectionValues => SECTION_DEFINITIONS[key].values(this.forms[key]),
        }
      : null;
  }

  private syncAll(): void {
    const context = this.wizardContext();

    if (!context) {
      return;
    }

    for (const key of Object.keys(this.forms) as ApplicationSectionKey[]) {
      (SECTION_DEFINITIONS[key] as SectionFormDefinition).sync(this.forms[key], context);
    }
  }

  /** Server field states of a section (read-only, source), for "Verified via ICP" hints. */
  fieldState(key: ApplicationSectionKey, fieldCode: string): SectionFieldState | null {
    return this.sectionStates()[key]?.fields.find(field => field.fieldCode === fieldCode) ?? null;
  }

  /** Step-owned state that must survive moving between steps (for example portfolio answers). */
  retain<T>(key: string, factory: () => T): T {
    if (!this.retained.has(key)) {
      this.retained.set(key, factory());
    }

    return this.retained.get(key) as T;
  }

  // Validity.

  /** True when the page's fields are valid and its required documents are uploaded. */
  isStepComplete(step: WizardStepId): boolean {
    const application = this.applicationState();

    switch (step) {
      case 'program':
        return application !== null && this.programForm.valid;
      case 'portfolio':
        return this.portfolioState()?.submittedAt != null;
      case 'pay-and-submit':
        return application !== null && application.status !== 'DRAFT';
      default: {
        const control = this.stepControl(step);

        return (control === null || control.valid || control.disabled) && this.missingSlots(step).length === 0;
      }
    }
  }

  /** The form part a page edits. */
  stepControl(step: WizardStepId): AbstractControl | null {
    if (step === 'program') {
      return this.programForm;
    }

    const personalGroup = PERSONAL_GROUPS[step];

    if (personalGroup) {
      return this.forms['personal-information'].get(personalGroup);
    }

    const section = stepSection(step);

    return section && step !== 'personal-attachments' ? this.forms[section] : null;
  }

  /** Required slots of the page without a file. */
  missingSlots(step: WizardStepId): readonly AttachmentSlot[] {
    const key = stepAttachmentSection(step);

    return key === null || key === 'portfolio'
      ? []
      : this.slotState().filter(slot => slot.sectionKey === key && slot.required && slot.attachment === null);
  }

  /** Pages that are not complete, for the pay & submit checklist (pay itself excluded). */
  readonly incompleteSteps = computed<readonly WizardStepId[]>(() => {
    this.revision();
    this.slotState();
    this.portfolioState();

    return this.steps().filter(step => step !== 'pay-and-submit' && !this.isStepComplete(step));
  });

  /** Shows all errors of a page. */
  check(step: WizardStepId): void {
    this.checked.update(set => new Set(set).add(step));
    this.stepControl(step)?.markAllAsTouched();
    this.revision.update(value => value + 1);
  }

  showsAllErrors(step: WizardStepId): boolean {
    return this.checked().has(step);
  }

  private pageStatus(step: WizardStepId): DahcWizardStepStatus {
    if (this.isStepComplete(step) && (this.visited().has(step) || this.mode() === 'view')) {
      return 'complete';
    }

    return this.visited().has(step) ? 'error' : 'upcoming';
  }

  private groupStatus(pages: readonly WizardStepId[]): DahcWizardStepStatus {
    const statuses = pages.map(page => this.pageStatus(page));

    if (statuses.includes('error')) {
      return 'error';
    }

    return statuses.every(status => status === 'complete') ? 'complete' : 'upcoming';
  }

  // Navigation.

  setCurrentStep(step: WizardStepId): void {
    const previous = this.currentStep();

    if (previous !== step) {
      this.visited.update(set => new Set(set).add(previous));
    }

    this.currentStep.set(step);
    this.visited.update(set => new Set(set).add(step));
    this.primaryAction.set(null);
  }

  /** Saves the current page (no completeness check, US-1.3.11) and opens another. */
  async goTo(step: WizardStepId): Promise<void> {
    if (this.editable() && !(await this.saveStep(this.currentStep()))) {
      return;
    }

    const application = this.applicationState();

    if (application) {
      await this.router.navigate(['/candidate/applications', application.id, 'steps', step]);
    }
  }

  async next(): Promise<void> {
    const current = this.currentStep();
    const next = this.nextStep();
    this.check(current);

    if (this.mode() === 'create') {
      await this.createDraft();

      return;
    }

    if (next) {
      await this.goTo(next);
    }
  }

  async back(): Promise<void> {
    const previous = this.previousStep();

    if (previous) {
      await this.goTo(previous);
    }
  }

  /** Stepper click: a group opens at its first page. */
  async openGroup(group: string): Promise<void> {
    const step = group === 'personal-information' ? 'personal-identity' : (group as WizardStepId);
    await this.goTo(this.steps().includes(step) ? step : (this.steps()[0] ?? 'program'));
  }

  // Saving.

  /** "Save As Draft": saves every changed section without completeness checks. */
  async saveDraft(): Promise<void> {
    if (this.mode() === 'create') {
      await this.createDraft();

      return;
    }

    if (await this.saveAll()) {
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.wizard.savedHeading:Draft saved`,
        message: $localize`:@@portal.wizard.savedMessage:You can continue later from your dashboard.`,
      });
    }
  }

  async saveAll(): Promise<boolean> {
    const application = this.applicationState();

    if (!application || this.mode() !== 'edit') {
      return true;
    }

    if (!(await this.saveStep('program'))) {
      return false;
    }

    for (const key of this.applicableSections(this.rules())) {
      if (this.forms[key].dirty && !(await this.saveSection(application, key))) {
        return false;
      }
    }

    return true;
  }

  /** Saves the data behind a page if it changed. Returns false when the save failed. */
  async saveStep(step: WizardStepId): Promise<boolean> {
    const application = this.applicationState();

    if (!application || this.mode() !== 'edit') {
      return true;
    }

    if (step === 'program') {
      return this.programForm.dirty ? this.savePreferences(application) : true;
    }

    const key = stepSection(step);

    return key ? this.saveSection(application, key) : true;
  }

  private async savePreferences(application: Application): Promise<boolean> {
    const rules = this.rules();

    if (!rules) {
      return true;
    }

    const preferences = programPreferences(this.programForm, rules.maxPreferences);

    if (preferences.length === 0) {
      // Nothing valid to save: the contract rejects invalid preferences (D-27). Keep the draft as it is.
      return true;
    }

    return this.serialize(() => this.run(async () => {
      const result = await firstValueFrom(
        this.applicationsApi.updateDraft(application.id, { preferences }, this.applicationEtag, CALLER_HANDLES()),
      );
      this.applicationEtag = result.etag ?? this.applicationEtag;
      this.applicationState.set(result.data);
      this.programForm.markAsPristine();
      await this.refreshSlots();
    }));
  }

  /**
   * Saves one section. Saves run one after another (a queued auto-save and a Next click never
   * race on the ETag); a silent save (auto-save) ignores failures, the next explicit save reports them.
   */
  private saveSection(application: Application, key: ApplicationSectionKey, silent = false): Promise<boolean> {
    return this.serialize(async () => {
      const form = this.forms[key];

      if (!form.dirty) {
        return true;
      }

      const section = this.sectionStates()[key];
      const values = SECTION_DEFINITIONS[key].values(form);
      const snapshot = JSON.stringify(values);
      const save = async (): Promise<void> => {
        const result = await firstValueFrom(
          this.applicationsApi.saveSection(
            application.id,
            key,
            { schemaVersion: section?.schemaVersion ?? '2026.1', values },
            this.sectionEtags.get(key) ?? 'W/"0"',
            CALLER_HANDLES(),
          ),
        );
        this.sectionEtags.set(key, result.etag ?? '');
        this.sectionStates.update(states => ({ ...states, [key]: result.data }));

        // Changes typed while the request ran stay dirty, so they are saved next time.
        if (JSON.stringify(SECTION_DEFINITIONS[key].values(form)) === snapshot) {
          form.markAsPristine();
        }

        await this.refreshSlots();
      };

      if (!silent) {
        return this.run(save);
      }

      try {
        await save();
        this.savedAt.set(new Date().toISOString());
      } catch {
        // Reported by the next explicit save.
      }

      return true;
    });
  }

  private saveChain: Promise<unknown> = Promise.resolve();

  private serialize<T>(task: () => Promise<T>): Promise<T> {
    const next = this.saveChain.then(task, task);
    this.saveChain = next.catch(() => undefined);

    return next;
  }

  private async createDraft(): Promise<void> {
    const program = this.selectedProgram();
    const rules = this.rules();
    this.check('program');

    if (!program || !rules || this.programForm.invalid) {
      return;
    }

    await this.run(async () => {
      const result = await firstValueFrom(
        this.applicationsApi.createDraft(
          program.cycleId ?? '',
          { programId: program.id, preferences: programPreferences(this.programForm, rules.maxPreferences) },
          this.createKey,
          CALLER_HANDLES(),
        ),
      );
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.wizard.createdHeading:Your draft has been created`,
        message: $localize`:@@portal.wizard.createdMessage:Continue with the next step, or save and come back before the deadline.`,
      });
      await this.router.navigate(['/candidate/applications', result.data.id, 'steps', 'application-information']);
    });
  }

  /** One key per create attempt, reused for retries of the same attempt. */
  private readonly createKey = crypto.randomUUID();

  // Attachments and portfolio.

  async refreshSlots(): Promise<void> {
    const application = this.applicationState();

    if (application) {
      const result = await firstValueFrom(this.attachmentsApi.listSlots(application.id));
      this.slotState.set(result.data);
    }
  }

  replaceSlot(slot: AttachmentSlot): void {
    this.slotState.update(slots => slots.map(item => (item.slotId === slot.slotId ? slot : item)));
  }

  setPortfolio(portfolio: PortfolioSubmission): void {
    this.portfolioState.set(portfolio);
  }

  setApplication(application: Application): void {
    this.applicationState.set(application);
    this.mode.set(application.status === 'DRAFT' ? 'edit' : 'view');
  }

  // Helpers.

  private applicableSections(rules: ProgramRules | null): ApplicationSectionKey[] {
    const keys: ApplicationSectionKey[] = ['application-information', 'personal-information'];

    for (const group of rules?.groups ?? []) {
      if (group in SECTION_DEFINITIONS && !keys.includes(group as ApplicationSectionKey)) {
        keys.push(group as ApplicationSectionKey);
      }
    }

    return keys;
  }

  private fetchSection(
    applicationId: string,
    key: ApplicationSectionKey,
  ): Observable<{ section: ApplicationSection; etag: string } | null> {
    return this.applicationsApi.getSection(applicationId, key, CALLER_HANDLES()).pipe(
      map(result => ({ section: result.data, etag: result.etag ?? '' })),
      catchError((error: unknown) => {
        if (isApiProblemError(error) && error.problem.status === 404) {
          return of(null);
        }

        throw error;
      }),
    );
  }

  private applyReadOnly(form: FormGroup, fields: readonly SectionFieldState[]): void {
    for (const field of fields) {
      if (field.readOnly) {
        form.get(field.fieldCode)?.disable({ emitEvent: false });
      }
    }
  }

  private async run(action: () => Promise<void>): Promise<boolean> {
    this.saving.set(true);
    this.saveProblem.set(null);

    try {
      await action();
      this.savedAt.set(new Date().toISOString());

      return true;
    } catch (error: unknown) {
      if (error instanceof ApiProblemError) {
        this.saveProblem.set(error.problem);

        return false;
      }

      throw error;
    } finally {
      this.saving.set(false);
    }
  }
}
