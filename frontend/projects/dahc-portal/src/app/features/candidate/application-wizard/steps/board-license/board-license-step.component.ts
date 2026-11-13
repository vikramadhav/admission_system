import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcButtonComponent,
  DahcDatePickerComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcRadioGroupComponent,
  DahcSelectComponent,
} from 'dahc-ui';

import { fieldError } from '../../../../../shared/forms/form-errors';
import {
  ATTEMPTS,
  BOARDS,
  EXAM_RESULTS,
  JOB_TITLES,
  LICENSE_AUTHORITIES,
  OTHER,
  YES_NO,
} from '../../../../../shared/reference-data';
import { SectionAttachmentsComponent } from '../../section-attachments.component';
import { WizardStateService } from '../../wizard-state.service';
import { BoardEntryForm, BoardLicenseForm, createBoardEntry } from './board-license.form';

/** Board & License (Figma 1:4647, US-1.3.8, Fellowship): one or more boards, the license, documents. */
@Component({
  selector: 'dahc-board-license-step',
  templateUrl: './board-license-step.component.html',
  styleUrls: ['../step.scss', './board-license-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcDatePickerComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcRadioGroupComponent,
    DahcSelectComponent,
    ReactiveFormsModule,
    SectionAttachmentsComponent,
  ],
})
export class BoardLicenseStepComponent {
  protected readonly state = inject(WizardStateService);
  protected readonly form = this.state.forms['board-license-information'] as BoardLicenseForm;
  protected readonly boardOptions = BOARDS;
  protected readonly yesNo = YES_NO;
  protected readonly results = EXAM_RESULTS;
  protected readonly attempts = ATTEMPTS;
  protected readonly authorities = LICENSE_AUTHORITIES;
  protected readonly jobTitles = JOB_TITLES;
  protected readonly other = OTHER;
  protected readonly today = new Date().toISOString().slice(0, 10);

  /** Boards can be added or removed only while the board list itself is editable (not in correction mode unless flagged, PQ-35). */
  protected get boardsEditable(): boolean {
    return this.state.editable() && this.form.controls.boards.enabled;
  }

  protected get boards(): readonly BoardEntryForm[] {
    return this.form.controls.boards.controls;
  }

  protected addBoard(): void {
    this.form.controls.boards.push(createBoardEntry());
    this.form.markAsDirty();
  }

  protected removeBoard(index: number): void {
    if (this.form.controls.boards.length > 1) {
      this.form.controls.boards.removeAt(index);
      this.form.markAsDirty();
    }
  }

  protected error(control: AbstractControl): string {
    this.state.revision();

    return fieldError(control, this.showAll());
  }

  protected isRequired(control: AbstractControl): boolean {
    this.state.revision();

    return control.hasValidator(Validators.required);
  }

  protected showAll(): boolean {
    return this.state.showsAllErrors('board-license-information');
  }

  protected boardHeading(index: number): string {
    return $localize`:@@portal.board.boardHeading:Board ${index + 1}:number:`;
  }

  protected removeLabel(index: number): string {
    return $localize`:@@portal.board.remove:Remove board ${index + 1}:number:`;
  }
}
