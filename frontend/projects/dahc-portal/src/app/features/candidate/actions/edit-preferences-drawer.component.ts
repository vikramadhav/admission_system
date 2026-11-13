import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { DahcAlertComponent, DahcButtonComponent, DahcDrawerComponent, DahcSelectOption, DahcToastService } from 'dahc-ui';
import { firstValueFrom, map, startWith } from 'rxjs';

import { Preference } from '../../../api/application.models';
import { ApplicationsApiService } from '../../../api/applications-api.service';
import { Program } from '../../../api/catalog.models';
import { CatalogNamesService } from '../../../shared/catalog-names.service';
import { programRules } from '../../../shared/program-rules';
import { actionProblemText } from './action-support';
import { PreferenceEditorComponent, createPreferenceGroup } from './preference-editor.component';
import { callerHandlesProblems } from '../../../core/api/api-request';

/**
 * Edit preferences after submission (US-1.2.6): reorder, remove or replace specialties and sites.
 * The status does not change. The save needs the latest ETag, so the application is read first.
 */
@Component({
  selector: 'dahc-edit-preferences-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcDrawerComponent, PreferenceEditorComponent],
  styleUrl: './actions.scss',
  template: `
    <dahc-drawer [(open)]="open" i18n-heading="@@portal.preferences.heading" heading="Edit preferences">
      <div class="action-form">
        <p class="action-muted" i18n="@@portal.preferences.text">
          You can change, reorder or remove your specialties and training sites until the grace period ends. Your application status does
          not change.
        </p>
        @if (loading()) {
          <p class="action-text" role="status" i18n="@@portal.preferences.loading">Loading your preferences…</p>
        } @else {
          <dahc-preference-editor
            [group]="form.controls.first"
            [specialtyId]="firstSpecialty()"
            i18n-specialtyLabel="@@portal.preferences.preference1"
            specialtyLabel="Preference 1"
            i18n-sitesLabel="@@portal.preferences.preference1Sites"
            sitesLabel="Preference 1 training sites"
            [specialtyOptions]="specialtyOptions()"
            [required]="true"
            [specialtyError]="firstSpecialtyError()"
            [sitesError]="sitesError('first')" />
          @if (maxPreferences() === 2) {
            <dahc-preference-editor
              [group]="form.controls.second"
              [specialtyId]="secondSpecialty()"
              i18n-specialtyLabel="@@portal.preferences.preference2"
              specialtyLabel="Preference 2 (optional)"
              i18n-sitesLabel="@@portal.preferences.preference2Sites"
              sitesLabel="Preference 2 training sites"
              [specialtyOptions]="specialtyOptions()"
              [specialtyError]="secondSpecialtyError()"
              [sitesError]="sitesError('second')" />
          }
        }
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </div>
      <div dahcDialogFooter class="action-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" [disabled]="loading()" (click)="save()" i18n="@@portal.preferences.save">
          Save preferences
        </button>
      </div>
    </dahc-drawer>
  `,
})
export class EditPreferencesDrawerComponent {
  private readonly applicationsApi = inject(ApplicationsApiService);
  private readonly names = inject(CatalogNamesService);
  private readonly toasts = inject(DahcToastService);

  readonly applicationId = input.required<string>();
  readonly program = input.required<Program>();
  readonly open = model<boolean>(false);
  readonly completed = output<void>();

  protected readonly form = new FormGroup({ first: createPreferenceGroup(), second: createPreferenceGroup() });
  protected readonly busy = signal<boolean>(false);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  private etag = '';

  private readonly formValue = toSignal(this.form.valueChanges.pipe(startWith(null), map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });
  protected readonly firstSpecialty = computed<string>(() => this.formValue().first.specialtyId);
  protected readonly secondSpecialty = computed<string>(() => this.formValue().second.specialtyId);
  protected readonly maxPreferences = computed<number>(() => programRules(this.program()).maxPreferences);

  protected readonly specialties = rxResource({
    params: () => (this.open() ? this.program().id : undefined),
    stream: ({ params }) => this.names.programSpecialties(params),
  });
  protected readonly specialtyOptions = computed<readonly DahcSelectOption[]>(() =>
    this.specialties.hasValue() ? this.specialties.value().map(item => ({ value: item.id, label: item.name })) : [],
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        void this.load();
      }
    });
  }

  protected firstSpecialtyError(): string {
    return this.attempted() && this.firstSpecialty() === ''
      ? $localize`:@@portal.preferences.specialtyRequired:Select a specialty.`
      : '';
  }

  protected secondSpecialtyError(): string {
    const second = this.secondSpecialty();

    return second !== '' && second === this.firstSpecialty()
      ? $localize`:@@portal.preferences.samePreference:Choose a different specialty from preference 1.`
      : '';
  }

  protected sitesError(key: 'first' | 'second'): string {
    const value = this.formValue()[key];

    return this.attempted() && value.specialtyId !== '' && value.siteIds.length === 0
      ? $localize`:@@portal.preferences.sitesRequired:Select at least one training site for this specialty.`
      : '';
  }

  protected async save(): Promise<void> {
    this.attempted.set(true);
    const value = this.form.getRawValue();

    if (this.firstSpecialtyError() !== '' || this.secondSpecialtyError() !== '' || this.sitesError('first') !== '' || this.sitesError('second') !== '') {
      return;
    }

    const preferences = [value.first, value.second]
      .filter((item, index) => item.specialtyId !== '' && index < this.maxPreferences())
      .map<Preference>((item, index) => ({
        specialtyId: item.specialtyId,
        preferenceOrder: index + 1,
        trainingSites: item.siteIds.map((siteId, siteIndex) => ({ siteId, siteOrder: siteIndex + 1 })),
      }));

    this.busy.set(true);
    this.error.set('');

    try {
      await firstValueFrom(this.applicationsApi.updatePreferences(this.applicationId(), preferences, this.etag, callerHandlesProblems()));
      this.toasts.show({ variant: 'success', heading: $localize`:@@portal.preferences.saved:Your preferences were saved.` });
      this.open.set(false);
      this.completed.emit();
    } catch (error: unknown) {
      this.error.set(actionProblemText(error));
    } finally {
      this.busy.set(false);
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.attempted.set(false);
    this.error.set('');

    try {
      const result = await firstValueFrom(this.applicationsApi.getApplication(this.applicationId()));
      this.etag = result.etag ?? '';
      const ordered = [...(result.data.preferences ?? [])].sort((first, second) => first.preferenceOrder - second.preferenceOrder);
      const toValue = (preference: Preference | undefined): { specialtyId: string; siteIds: string[] } => ({
        specialtyId: preference?.specialtyId ?? '',
        siteIds: [...(preference?.trainingSites ?? [])].sort((first, second) => first.siteOrder - second.siteOrder).map(site => site.siteId),
      });
      this.form.reset({ first: toValue(ordered[0]), second: toValue(ordered[1]) });
    } catch (error: unknown) {
      this.error.set(actionProblemText(error));
    } finally {
      this.loading.set(false);
    }
  }
}

