import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, untracked } from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { DahcAlertComponent, DahcFormFieldComponent, DahcInputDirective, DahcSelectComponent, DahcSelectOption } from 'dahc-ui';
import { map, startWith } from 'rxjs';

import { CatalogApiService } from '../../../../../api/catalog-api.service';
import { Program } from '../../../../../api/catalog.models';
import { CatalogNamesService } from '../../../../../shared/catalog-names.service';
import { fieldError } from '../../../../../shared/forms/form-errors';
import { WizardStateService } from '../../wizard-state.service';
import { PreferenceCardComponent } from './preference-card.component';

/**
 * Step 1, Program & Preferences (Figma 1:2189, US-1.3.1). On a new application the program is
 * chosen here and the draft is created on Next. After that the program is fixed (the contract
 * cannot change it, see doc 02) and only the preferences change.
 */
@Component({
  selector: 'dahc-program-step',
  templateUrl: './program-step.component.html',
  styleUrl: '../step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcFormFieldComponent, DahcInputDirective, DahcSelectComponent, PreferenceCardComponent, ReactiveFormsModule],
})
export class ProgramStepComponent {
  private readonly catalog = inject(CatalogApiService);
  private readonly names = inject(CatalogNamesService);

  protected readonly state = inject(WizardStateService);
  protected readonly form = this.state.programForm;

  protected readonly programs = rxResource({ stream: () => this.catalog.listPrograms().pipe(map(result => result.data)) });
  protected readonly programOptions = computed<readonly DahcSelectOption[]>(() =>
    this.programs.hasValue() ? this.programs.value().map(program => ({ value: program.id, label: program.name })) : [],
  );

  private readonly programId = toSignal(
    this.form.controls.programId.valueChanges.pipe(startWith(this.form.controls.programId.value)),
    { initialValue: '' },
  );

  protected readonly specialties = rxResource({
    params: () => this.state.program()?.id,
    stream: ({ params }) => this.names.programSpecialties(params),
  });
  protected readonly specialtyOptions = computed<readonly DahcSelectOption[]>(() =>
    this.specialties.hasValue() ? this.specialties.value().map(item => ({ value: item.id, label: item.name })) : [],
  );

  protected readonly cycle = computed<string>(() => {
    const opens = this.state.program()?.applicationOpensAt;
    const year = opens ? new Date(opens).getUTCFullYear() : null;

    return year === null ? '' : `${year}–${year + 1}`;
  });

  protected readonly twoPreferences = computed<boolean>(() => (this.state.rules()?.maxPreferences ?? 1) === 2);

  constructor() {
    // In create mode the chosen program decides the rules and the steps.
    effect(() => {
      const id = this.programId();
      const programs = this.programs.hasValue() ? this.programs.value() : [];

      untracked(() => {
        if (this.state.mode() === 'create') {
          this.state.selectProgram(programs.find((program: Program) => program.id === id) ?? null);
        }
      });
    });

    // A specialty the candidate changes starts its site list again (loading saved values does not).
    const destroyRef = inject(DestroyRef);

    for (const group of [this.form.controls.preference1, this.form.controls.preference2]) {
      group.controls.specialtyId.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
        if (group.controls.specialtyId.dirty) {
          group.controls.siteIds.setValue([]);
        }
      });
    }
  }

  protected showAll(): boolean {
    return this.state.showsAllErrors('program');
  }

  protected programError(): string {
    return fieldError(this.form.controls.programId, this.showAll());
  }

  protected samePreferenceError(): string {
    return this.form.hasError('samePreference') && (this.form.controls.preference2.touched || this.showAll())
      ? $localize`:@@portal.program.samePreference:Choose a different specialty from your first preference.`
      : '';
  }
}
