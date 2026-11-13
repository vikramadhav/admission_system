import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { SectionValues } from '../../../../../api/candidate-lifecycle.models';
import { futureDate, pastDate, requireWhen } from '../../../../../shared/forms/form-errors';
import { OTHER } from '../../../../../shared/reference-data';
import { BoardEntryValues, BoardLicenseValues, YesNo } from '../../../../../shared/section-values';
import { SectionFormDefinition } from '../../wizard-model';

type Text = FormControl<string>;

export type BoardEntryForm = FormGroup<{
  boardName: Text;
  satWrittenExam: FormControl<YesNo>;
  scheduledExamDate: Text;
  examDate: Text;
  examResult: Text;
  writtenAttempt: Text;
  osceDate: Text;
  osceAttempt: Text;
  resitDate: Text;
}>;

export type BoardLicenseForm = FormGroup<{
  boards: FormArray<BoardEntryForm>;
  authority: Text;
  otherAuthority: Text;
  licenseNumber: Text;
  jobTitle: Text;
  otherJobTitle: Text;
}>;

const text = (): Text => new FormControl('', { nonNullable: true });

export function createBoardEntry(): BoardEntryForm {
  return new FormGroup({
    boardName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    satWrittenExam: new FormControl<YesNo>('', { nonNullable: true, validators: [Validators.required] }),
    scheduledExamDate: new FormControl('', { nonNullable: true, validators: [futureDate] }),
    examDate: new FormControl('', { nonNullable: true, validators: [pastDate] }),
    examResult: text(),
    writtenAttempt: text(),
    osceDate: text(),
    osceAttempt: text(),
    resitDate: new FormControl('', { nonNullable: true, validators: [futureDate] }),
  });
}

/**
 * Board & license, Fellowship only (US-1.3.8, SBRD:645-689; Figma 1:4647). At least one board;
 * the exam fields follow the answers. The license is optional, but once an authority is chosen
 * the number and job title are required (AC9; the data dictionary says optional, OQ-C17).
 */
export const boardLicenseDefinition: SectionFormDefinition<BoardLicenseForm> = {
  key: 'board-license-information',

  create(): BoardLicenseForm {
    return new FormGroup({
      boards: new FormArray<BoardEntryForm>([createBoardEntry()], { validators: [Validators.minLength(1)] }),
      authority: new FormControl('', { nonNullable: true }),
      otherAuthority: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      licenseNumber: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(50)] }),
      jobTitle: new FormControl('', { nonNullable: true }),
      otherJobTitle: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
    });
  },

  patch(form, values): void {
    const saved = values as Partial<BoardLicenseValues>;
    const boards = Array.isArray(saved.boards) && saved.boards.length > 0 ? saved.boards : [null];
    const array = form.controls.boards;

    array.clear({ emitEvent: false });

    for (const board of boards) {
      const entry = createBoardEntry();

      if (board) {
        entry.patchValue(board as Partial<BoardEntryValues>, { emitEvent: false });
      }

      array.push(entry, { emitEvent: false });
    }

    form.patchValue(
      {
        authority: saved.authority ?? '',
        otherAuthority: saved.otherAuthority ?? '',
        licenseNumber: saved.licenseNumber ?? '',
        jobTitle: saved.jobTitle ?? '',
        otherJobTitle: saved.otherJobTitle ?? '',
      },
      { emitEvent: false },
    );
  },

  sync(form): void {
    for (const entry of form.controls.boards.controls) {
      const controls = entry.controls;
      const sat = controls.satWrittenExam.value === 'YES';

      requireWhen(controls.scheduledExamDate, controls.satWrittenExam.value === 'NO');
      requireWhen(controls.examDate, sat);
      requireWhen(controls.examResult, sat);
      requireWhen(controls.writtenAttempt, sat);
      requireWhen(controls.osceDate, sat);
      requireWhen(controls.osceAttempt, sat);
      requireWhen(controls.resitDate, sat && controls.examResult.value === 'FAIL');
    }

    const controls = form.controls;
    const licensed = controls.authority.value !== '';

    requireWhen(controls.otherAuthority, controls.authority.value === OTHER);
    requireWhen(controls.licenseNumber, licensed);
    requireWhen(controls.jobTitle, licensed);
    requireWhen(controls.otherJobTitle, controls.jobTitle.value === OTHER);
  },

  values(form): SectionValues {
    return form.getRawValue();
  },
};
