import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcRadioGroupComponent,
  DahcSelectComponent,
  DahcSelectOption,
} from 'dahc-ui';

import { fieldError } from '../../../../../shared/forms/form-errors';
import { COUNTRIES, GPA_TYPES, OTHER, graduationYears, months, universityOptions } from '../../../../../shared/reference-data';
import { SectionAttachmentsComponent } from '../../section-attachments.component';
import { WizardStateService } from '../../wizard-state.service';
import { AcademicInformationForm, gpaPercent } from './academic.form';

type Field = keyof AcademicInformationForm['controls'];

/** University Grades (Figma 1:3827, US-1.3.4): university, degree, GPA with its conversion, documents. */
@Component({
  selector: 'dahc-academic-step',
  templateUrl: './academic-step.component.html',
  styleUrl: '../step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcInputDirective, DahcRadioGroupComponent, DahcSelectComponent, ReactiveFormsModule, SectionAttachmentsComponent],
})
export class AcademicStepComponent {
  protected readonly state = inject(WizardStateService);
  protected readonly form = this.state.forms['academic-information'] as AcademicInformationForm;
  protected readonly countries = COUNTRIES;
  protected readonly gpaTypes = GPA_TYPES;
  protected readonly years = graduationYears();
  protected readonly months = months(inject(LOCALE_ID));
  protected readonly other = OTHER;

  protected readonly degrees = computed<readonly DahcSelectOption[]>(() =>
    (this.state.rules()?.degrees ?? []).map(degree => ({ value: degree, label: degree })),
  );

  protected readonly universities = computed<readonly DahcSelectOption[]>(() => {
    this.state.revision();

    return universityOptions(this.form.controls.country.value);
  });

  /** GPA Result as shown: "75.00 %". */
  protected readonly gpaResult = computed<string>(() => {
    this.state.revision();
    const percent = gpaPercent(this.form.getRawValue());

    return percent === null ? '' : `${percent.toFixed(2)} %`;
  });

  /** "26.25 / 35" (percentage × program GPA weight); null when the program has no GPA weight. */
  protected readonly shortlistingScore = computed<string | null>(() => {
    this.state.revision();
    const weight = this.state.rules()?.gpaWeight ?? null;

    if (weight === null) {
      return null;
    }

    const percent = gpaPercent(this.form.getRawValue());

    return percent === null ? '' : `${((percent * weight) / 100).toFixed(2)} / ${weight}`;
  });

  constructor() {
    // A country the candidate changes starts the university choice again.
    this.form.controls.country.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.form.controls.country.dirty) {
        this.form.controls.university.setValue('');
        this.form.controls.otherUniversity.setValue('');
      }
    });
  }

  protected error(name: Field): string {
    this.state.revision();

    return fieldError(this.form.controls[name], this.state.showsAllErrors('academic-information'));
  }

  protected isRequired(name: Field): boolean {
    this.state.revision();

    return this.form.controls[name].hasValidator(Validators.required);
  }

  protected showAll(): boolean {
    return this.state.showsAllErrors('academic-information');
  }

  /** Out-of-range GPA only warns (US-1.3.4 AC9). */
  protected rangeWarning(name: Field, max: number): string {
    this.state.revision();
    const value = this.form.controls[name].value.trim();
    const number = Number(value);

    return value !== '' && !Number.isNaN(number) && number > max
      ? $localize`:@@portal.academic.rangeWarning:This is above ${max}:max:. Check the value before you continue.`
      : '';
  }
}
