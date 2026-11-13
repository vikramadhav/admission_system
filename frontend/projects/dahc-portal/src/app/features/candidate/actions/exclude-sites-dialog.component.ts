import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCheckboxComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcToastService,
} from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { ApplicationsApiService } from '../../../api/applications-api.service';
import { PreferenceView } from '../../../shared/catalog-names.service';
import { actionProblemText, meaningfulReason, reasonErrorText } from './action-support';
import { callerHandlesProblems } from '../../../core/api/api-request';

const MAX_REASON = 500;

/**
 * Exclude training sites (US-1.2.8): sites grouped by specialty, one reason for the whole
 * action. The last remaining site of a specialty cannot be excluded; nothing can be added or reordered.
 */
@Component({
  selector: 'dahc-exclude-sites-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCheckboxComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcModalComponent,
    ReactiveFormsModule,
  ],
  styleUrl: './actions.scss',
  templateUrl: './exclude-sites-dialog.component.html',
})
export class ExcludeSitesDialogComponent {
  private readonly applicationsApi = inject(ApplicationsApiService);
  private readonly toasts = inject(DahcToastService);

  readonly applicationId = input.required<string>();
  /** Current preferences with names; sites already excluded are not listed. */
  readonly preferences = input<readonly PreferenceView[]>([]);
  readonly open = model<boolean>(false);
  readonly completed = output<void>();

  protected readonly selected = signal<readonly string[]>([]);
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  protected readonly reason = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(MAX_REASON), meaningfulReason],
  });
  /** One checkbox control per site id, so a site listed under two specialties stays in step. */
  private readonly controls = new Map<string, FormControl<boolean>>();

  /** Specialties whose every site is ticked: the exclusion would leave them empty. */
  protected readonly emptied = computed<readonly string[]>(() => {
    const selected = this.selected();

    return this.preferences()
      .filter(preference => preference.sites.length > 0 && preference.sites.every(site => selected.includes(site.id)))
      .map(preference => preference.specialtyName);
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.controls.forEach(control => control.setValue(false, { emitEvent: false }));
        this.selected.set([]);
        this.syncLocks();
        this.reason.reset('');
        this.attempted.set(false);
        this.error.set('');
      }
    });
  }

  protected control(siteId: string): FormControl<boolean> {
    let control = this.controls.get(siteId);

    if (!control) {
      control = new FormControl<boolean>(false, { nonNullable: true });
      control.valueChanges.subscribe(checked => {
        this.selected.update(list => (checked ? [...new Set([...list, siteId])] : list.filter(id => id !== siteId)));
        this.syncLocks();
      });
      this.controls.set(siteId, control);

      if (this.isLocked(siteId)) {
        control.disable({ emitEvent: false });
      }
    }

    return control;
  }

  /** Disables the boxes that would leave a specialty without sites. */
  private syncLocks(): void {
    this.controls.forEach((control, siteId) => {
      if (this.isLocked(siteId)) {
        control.disable({ emitEvent: false });
      } else {
        control.enable({ emitEvent: false });
      }
    });
  }

  /** A site cannot be ticked when it is the only unticked site left in one of its specialties. */
  private isLocked(siteId: string): boolean {
    if (this.selected().includes(siteId)) {
      return false;
    }

    return this.preferences().some(
      preference =>
        preference.sites.some(site => site.id === siteId) &&
        preference.sites.filter(site => !this.selected().includes(site.id)).length <= 1,
    );
  }

  protected reasonError(): string {
    return reasonErrorText(this.reason, this.attempted());
  }

  protected selectionError(): string {
    if (this.emptied().length > 0) {
      return $localize`:@@portal.exclude.lastSite:Keep at least one training site for each specialty.`;
    }

    return this.attempted() && this.selected().length === 0
      ? $localize`:@@portal.exclude.noneSelected:Select at least one training site to exclude.`
      : '';
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    this.reason.markAsTouched();

    if (this.selected().length === 0 || this.emptied().length > 0 || this.reason.invalid) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await firstValueFrom(
        this.applicationsApi.excludeTrainingSites(this.applicationId(), {
          siteIds: [...this.selected()],
          reason: this.reason.value.trim(),
        }, callerHandlesProblems()),
      );
      this.toasts.show({ variant: 'success', heading: $localize`:@@portal.exclude.done:The training sites were excluded.` });
      this.open.set(false);
      this.completed.emit();
    } catch (error: unknown) {
      this.error.set(actionProblemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
