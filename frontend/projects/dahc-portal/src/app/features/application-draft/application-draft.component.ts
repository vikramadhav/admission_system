import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcLiveAnnouncer,
  DahcPageHeaderComponent,
  DahcSelectComponent,
  DahcSelectOption,
} from 'dahc-ui';
import { startWith } from 'rxjs';

import { Application, Preference } from '../../api/application.models';
import { ApplicationsApiService } from '../../api/applications-api.service';
import { CatalogApiService } from '../../api/catalog-api.service';
import { Program, ProgramCategory } from '../../api/catalog.models';
import { isApiProblemError } from '../../core/api/api-problem-error';
import { SessionService } from '../../core/auth/session.service';
import { DahcDateTimePipe } from '../../core/locale/date-time.pipe';
import { applicationStatusDisplay } from '../dashboard/application-status-display';
import { PreferenceFieldsComponent } from './preference-fields.component';
import {
  ApplicationDraftForm,
  PreferenceForm,
  distinctPreferences,
  sitesRequiredForSpecialty,
  toPreference,
  toPreferenceValue,
} from './preference-form';

/**
 * Categories whose programs accept a second specialty preference (BRD US-1.3.1 notes 3-4).
 * A usability aid only: the contract does not yet return the allowed count per program, and
 * the API validates every request.
 */
const TWO_PREFERENCE_CATEGORIES: readonly ProgramCategory[] = ['RESIDENCY', 'FELLOWSHIP'];

interface DraftNavigationState {
  readonly draftCreated?: boolean;
}

/**
 * New application (US-1.3.1): program, preference 1 and, where allowed, preference 2 with
 * ordered training sites, then creates the draft. With an application id it resumes that
 * draft and saves preference changes with If-Match (US-1.3.11, core save and resume).
 */
@Component({
  selector: 'dahc-application-draft',
  templateUrl: './application-draft.component.html',
  styleUrl: './application-draft.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcDateTimePipe,
    DahcPageHeaderComponent,
    DahcSelectComponent,
    PreferenceFieldsComponent,
    ReactiveFormsModule,
  ],
})
export class ApplicationDraftComponent {
  /** Route parameter; absent for a new application. */
  readonly applicationId = input<string>();

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly applicationsApi = inject(ApplicationsApiService);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly announcer = inject(DahcLiveAnnouncer);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigationState = inject(Location).getState() as DraftNavigationState | null;
  private idempotencyKey: string | null = null;

  protected readonly timeZoneId = inject(SessionService).timeZoneId;
  protected readonly form: ApplicationDraftForm = this.formBuilder.group(
    {
      programId: this.formBuilder.control('', Validators.required),
      preference1: this.createPreferenceGroup(true),
      preference2: this.createPreferenceGroup(false),
    },
    { validators: distinctPreferences },
  );

  protected readonly isNew = computed<boolean>(() => this.applicationId() === undefined);
  protected readonly submitAttempted = signal<boolean>(false);
  protected readonly busy = signal<boolean>(false);
  protected readonly etag = signal<string | null>(null);
  protected readonly savedAt = signal<string | null>(null);
  protected readonly staleDraft = signal<boolean>(false);
  protected readonly draftCreated = signal<boolean>(this.navigationState?.draftCreated === true);

  protected readonly programs = rxResource({
    params: () => (this.isNew() ? true : undefined),
    stream: () => this.catalogApi.listPrograms(),
  });

  protected readonly application = rxResource({
    params: () => this.applicationId(),
    stream: ({ params }) => this.applicationsApi.getApplication(params),
  });

  protected readonly programIdValue = toSignal(
    this.form.controls.programId.valueChanges.pipe(startWith(this.form.controls.programId.value)),
    { requireSync: true },
  );

  protected readonly preference1SpecialtyId = this.specialtySignal(this.form.controls.preference1);
  protected readonly preference2SpecialtyId = this.specialtySignal(this.form.controls.preference2);

  protected readonly specialties = rxResource({
    params: () => (this.programIdValue() === '' ? undefined : this.programIdValue()),
    stream: ({ params }) => this.catalogApi.listProgramSpecialties(params),
  });

  protected readonly loadedApplication = computed<Application | null>(() =>
    this.application.hasValue() ? this.application.value().data : null,
  );

  protected readonly selectedProgram = computed<Program | null>(() => {
    const application = this.loadedApplication();

    if (application !== null) {
      return application.program;
    }

    const programs = this.programs.hasValue() ? this.programs.value().data : [];

    return programs.find(program => program.id === this.programIdValue()) ?? null;
  });

  protected readonly programOptions = computed<readonly DahcSelectOption[]>(() => {
    const application = this.loadedApplication();

    if (application !== null) {
      return [{ value: application.program.id, label: application.program.name }];
    }

    return this.programs.hasValue()
      ? this.programs.value().data.map(program => ({ value: program.id, label: program.name }))
      : [];
  });

  protected readonly noOpenPrograms = computed<string>(() =>
    this.programs.hasValue() && this.programs.value().data.length === 0
      ? (this.programs.value().message ?? $localize`:@@portal.draft.noPrograms:No program is open for applications at the moment.`)
      : '',
  );

  protected readonly specialtyOptions = computed<readonly DahcSelectOption[]>(() =>
    this.specialties.hasValue()
      ? this.specialties.value().data.map(specialty => ({ value: specialty.id, label: specialty.name }))
      : [],
  );

  protected readonly allowsSecondPreference = computed<boolean>(() => {
    const program = this.selectedProgram();

    return program !== null && TWO_PREFERENCE_CATEGORIES.includes(program.category);
  });

  protected readonly isEditable = computed<boolean>(() => {
    const application = this.loadedApplication();

    return application === null || application.status === 'DRAFT';
  });

  protected readonly heading = computed<string>(() =>
    this.isNew()
      ? $localize`:@@portal.draft.newHeading:New application`
      : $localize`:@@portal.draft.resumeHeading:Application draft`,
  );

  protected readonly description = computed<string>(() => {
    const application = this.loadedApplication();

    if (application === null) {
      return $localize`:@@portal.draft.newDescription:Choose your program, your specialty preferences and the training sites for each specialty.`;
    }

    const status = applicationStatusDisplay(application.status).label;

    return $localize`:@@portal.draft.resumeDescription:${application.program.name}:program: · Application ID ${application.applicationNumber}:number: · ${status}:status:`;
  });

  constructor() {
    this.form.controls.programId.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.form.controls.preference1.reset();
      this.form.controls.preference2.reset();
    });

    this.resetSitesWhenSpecialtyChanges(this.form.controls.preference1);
    this.resetSitesWhenSpecialtyChanges(this.form.controls.preference2);

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.idempotencyKey = null;
    });

    // For a new application the second preference follows the chosen program; a resumed
    // draft sets it once when the draft is loaded.
    effect(() => {
      const allowed = this.allowsSecondPreference();

      if (this.isNew()) {
        untracked(() => this.setSecondPreferenceAvailable(allowed));
      }
    });

    effect(() => {
      const application = this.loadedApplication();

      if (application !== null) {
        untracked(() => this.loadApplicationIntoForm(application));
      }
    });

    effect(() => {
      if (this.application.hasValue()) {
        this.etag.set(this.application.value().etag);
      }
    });
  }

  protected programError(): string {
    const control = this.form.controls.programId;

    if (control.hasError('required') && (control.touched || this.submitAttempted())) {
      return $localize`:@@portal.draft.programRequired:Select a program.`;
    }

    return '';
  }

  protected samePreferenceError(): string {
    return this.form.hasError('samePreference')
      ? $localize`:@@portal.draft.samePreference:Preference 2 must be a different specialty from preference 1.`
      : '';
  }

  /** US-1.3.1 AC12-AC14: validate everything, then create the draft once. */
  protected createDraft(): void {
    this.submitAttempted.set(true);
    this.form.markAllAsTouched();
    const program = this.selectedProgram();

    if (this.form.invalid || program === null || this.busy()) {
      this.announcer.announce(
        $localize`:@@portal.draft.fixErrors:Some answers need your attention. Check the highlighted fields.`,
        'assertive',
      );

      return;
    }

    if (!program.cycleId) {
      this.announcer.announce(this.noOpenProgramMessage(), 'assertive');

      return;
    }

    this.idempotencyKey ??= crypto.randomUUID();
    this.busy.set(true);

    this.applicationsApi
      .createDraft(program.cycleId, { programId: program.id, preferences: this.collectPreferences() }, this.idempotencyKey)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.busy.set(false);
          const state: DraftNavigationState = { draftCreated: true };
          void this.router.navigate(['/applications', result.data.id], { state });
        },
        error: () => this.busy.set(false),
      });
  }

  /** US-1.3.11 AC1-AC2: saves whatever is filled in, without completeness validation. */
  protected saveDraft(): void {
    const applicationId = this.applicationId();
    const etag = this.etag();

    if (applicationId === undefined || etag === null || this.busy()) {
      return;
    }

    this.busy.set(true);
    this.staleDraft.set(false);
    this.draftCreated.set(false);

    this.applicationsApi
      .updateDraft(applicationId, { preferences: this.collectPreferences() }, etag)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.busy.set(false);
          this.etag.set(result.etag);
          this.savedAt.set(new Date().toISOString());
          this.announcer.announce($localize`:@@portal.draft.savedAnnouncement:Your draft has been saved.`);
        },
        error: (error: unknown) => {
          this.busy.set(false);

          if (isApiProblemError(error) && error.status === 412) {
            this.staleDraft.set(true);
          }
        },
      });
  }

  protected reloadDraft(): void {
    this.staleDraft.set(false);
    this.savedAt.set(null);
    this.application.reload();
  }

  protected backToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }

  private collectPreferences(): Preference[] {
    const preferences: Preference[] = [];
    const first = toPreference(this.form.controls.preference1, 1);
    const second = this.form.controls.preference2.enabled ? toPreference(this.form.controls.preference2, 2) : null;

    if (first !== null) {
      preferences.push(first);
    }

    if (second !== null) {
      preferences.push(second);
    }

    return preferences;
  }

  private loadApplicationIntoForm(application: Application): void {
    const preferences = application.preferences ?? [];
    const first = preferences.find(preference => preference.preferenceOrder === 1);
    const second = preferences.find(preference => preference.preferenceOrder === 2);

    this.form.controls.programId.setValue(application.program.id);
    this.form.controls.programId.disable({ emitEvent: false });
    this.form.controls.preference1.setValue(toPreferenceValue(first));
    this.setSecondPreferenceAvailable(this.allowsSecondPreference());

    if (this.form.controls.preference2.enabled) {
      this.form.controls.preference2.setValue(toPreferenceValue(second));
    }

    if (application.status !== 'DRAFT') {
      this.form.disable({ emitEvent: false });
    }

    this.form.markAsPristine();
  }

  private setSecondPreferenceAvailable(available: boolean): void {
    const preference2 = this.form.controls.preference2;

    if (available) {
      preference2.enable({ emitEvent: false });
    } else {
      preference2.reset({ specialtyId: '', siteIds: [] }, { emitEvent: false });
      preference2.disable({ emitEvent: false });
    }
  }

  private createPreferenceGroup(required: boolean): PreferenceForm {
    return this.formBuilder.group(
      {
        specialtyId: this.formBuilder.control('', required ? Validators.required : []),
        siteIds: this.formBuilder.control<string[]>([]),
      },
      { validators: sitesRequiredForSpecialty },
    );
  }

  private specialtySignal(group: PreferenceForm): () => string {
    const control = group.controls.specialtyId;

    return toSignal(control.valueChanges.pipe(startWith(control.value)), { requireSync: true });
  }

  private resetSitesWhenSpecialtyChanges(group: PreferenceForm): void {
    group.controls.specialtyId.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      group.controls.siteIds.setValue([], { emitEvent: false });
    });
  }

  private noOpenProgramMessage(): string {
    return $localize`:@@portal.draft.programClosed:This program is not open for applications. Choose another program.`;
  }
}
