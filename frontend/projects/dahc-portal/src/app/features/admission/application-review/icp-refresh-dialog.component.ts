import { ChangeDetectionStrategy, Component, computed, effect, inject, model, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCheckboxComponent,
  DahcIconComponent,
  DahcModalComponent,
  DahcRadioGroupComponent,
  DahcRadioOption,
} from 'dahc-ui';

import { IcpRefreshReason } from '../../../api/admission-api.service';
import { IcpRefreshPreview } from '../../../api/admission.models';
import { ReviewActionDone, controlError, problemText } from './review-support';
import { ReviewFacade } from './review.facade';

type Step = 'reason' | 'compare' | 'confirm';

/**
 * Refreshes the candidate's ICP data (US-2.5.3): choose the reason, compare the stored values with
 * the latest ICP values (differences marked with an icon and text), pick the fields to update
 * (only those that differ), then confirm. Closing without applying changes nothing.
 */
@Component({
  selector: 'dahc-icp-refresh-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcCheckboxComponent, DahcIconComponent, DahcModalComponent, DahcRadioGroupComponent, ReactiveFormsModule],
  styleUrl: './review-dialogs.scss',
  styles: `
    .compare { inline-size: 100%; border-collapse: collapse; }
    .compare-wrap { overflow-x: auto; }
    .compare th, .compare td { padding: var(--dahc-space-2) var(--dahc-space-3); border-block-end: 1px solid var(--dahc-color-border-subtle); text-align: start; vertical-align: top; overflow-wrap: anywhere; }
    .compare th { font-weight: var(--dahc-font-weight-bold); }
    .differs { display: inline-flex; align-items: center; gap: var(--dahc-space-1); font-weight: var(--dahc-font-weight-bold); }
  `,
  template: `
    <dahc-modal [(open)]="open" size="lg" i18n-heading="@@portal.admission.review.icp.heading" heading="Refresh ICP data">
      <div class="review-form">
        @switch (step()) {
          @case ('reason') {
            <dahc-radio-group
              [formControl]="reason"
              i18n-label="@@portal.admission.review.icp.reason"
              label="Why are you refreshing the data?"
              orientation="vertical"
              [required]="true"
              [options]="reasons"
              [invalid]="reasonError() !== ''"
              [errorMessage]="reasonError()" />
          }
          @case ('compare') {
            @if (preview(); as data) {
              @if (!data.differencesFound) {
                <dahc-alert variant="success" [announce]="true" i18n="@@portal.admission.review.icp.noChanges">No updates required: the stored data matches ICP.</dahc-alert>
              } @else {
                <p class="review-muted" i18n="@@portal.admission.review.icp.compareIntro">Select the fields to update with the ICP value. Only fields that differ can be selected.</p>
                <div class="compare-wrap" role="region" tabindex="0" i18n-aria-label="@@portal.admission.review.icp.tableLabel" aria-label="ICP comparison">
                  <table class="compare">
                    <caption class="dahc-visually-hidden" i18n="@@portal.admission.review.icp.caption">Stored values compared with ICP</caption>
                    <thead>
                      <tr>
                        <th scope="col" i18n="@@portal.admission.review.icp.update">Update</th>
                        <th scope="col" i18n="@@portal.admission.review.icp.field">Field</th>
                        <th scope="col" i18n="@@portal.admission.review.icp.current">Current value</th>
                        <th scope="col" i18n="@@portal.admission.review.icp.icpValue">ICP value</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (field of data.fields; track field.fieldCode) {
                        <tr>
                          <td>
                            <dahc-checkbox [formControl]="checkFor(field.fieldCode)" (change)="syncSelection()">
                              <span class="dahc-visually-hidden" i18n="@@portal.admission.review.icp.updateField">Update {{ field.label }}</span>
                            </dahc-checkbox>
                          </td>
                          <th scope="row">{{ field.label }}</th>
                          <td>{{ field.currentValue || '–' }}</td>
                          <td>
                            @if (field.differs) {
                              <span class="differs">
                                <dahc-icon name="information" size="sm" />
                                <span>{{ field.icpValue || '–' }}</span>
                                <span class="dahc-visually-hidden" i18n="@@portal.admission.review.icp.different">(different)</span>
                              </span>
                            } @else {
                              <span>{{ field.icpValue || '–' }}</span>
                              <span class="dahc-visually-hidden" i18n="@@portal.admission.review.icp.same">(same)</span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            }
          }
          @case ('confirm') {
            <p class="review-text" i18n="@@portal.admission.review.icp.confirmText">
              Update {selected().length, plural, =1 {1 field} other {{{ selected().length }} fields}} with the ICP value? The change is recorded in the audit log.
            </p>
          }
        }
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </div>
      <div dahcDialogFooter class="review-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        @switch (step()) {
          @case ('reason') {
            <button dahc-button type="button" [loading]="busy()" (click)="compare()" i18n="@@portal.admission.review.icp.compare">Compare with ICP</button>
          }
          @case ('compare') {
            @if (preview()?.differencesFound) {
              <button dahc-button type="button" variant="secondary" (click)="selectAll()" i18n="@@portal.admission.review.icp.updateAll">Update all</button>
              <button dahc-button type="button" [disabled]="selected().length === 0" (click)="step.set('confirm')" i18n="@@portal.admission.review.icp.apply">Apply changes</button>
            }
          }
          @case ('confirm') {
            <button dahc-button type="button" [loading]="busy()" (click)="apply()" i18n="@@portal.admission.review.icp.confirm">Confirm update</button>
          }
        }
      </div>
    </dahc-modal>
  `,
})
export class IcpRefreshDialogComponent {
  private readonly facade = inject(ReviewFacade);

  readonly open = model<boolean>(false);
  readonly completed = output<ReviewActionDone>();

  protected readonly reasons: readonly DahcRadioOption[] = [
    { value: 'IDENTITY_EXPIRY', label: $localize`:@@portal.admission.review.icp.identityExpiry:Identity document expired` },
    { value: 'DETAILS_CHANGE', label: $localize`:@@portal.admission.review.icp.detailsChange:The candidate's details changed` },
  ];
  protected readonly reason = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
  protected readonly step = signal<Step>('reason');
  protected readonly preview = signal<IcpRefreshPreview | null>(null);
  protected readonly selected = signal<readonly string[]>([]);
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  private readonly checks = new Map<string, FormControl<boolean>>();
  private readonly differing = computed<readonly string[]>(() => (this.preview()?.fields ?? []).filter(field => field.differs).map(field => field.fieldCode));

  constructor() {
    effect(() => {
      if (this.open()) {
        this.reason.reset('');
        this.step.set('reason');
        this.preview.set(null);
        this.checks.clear();
        this.selected.set([]);
        this.attempted.set(false);
        this.error.set('');
      }
    });
  }

  protected reasonError(): string {
    return controlError(this.reason, this.attempted());
  }

  /** One checkbox per compared field; only fields that differ can be selected. */
  protected checkFor(fieldCode: string): FormControl<boolean> {
    let control = this.checks.get(fieldCode);

    if (!control) {
      const differs = this.differing().includes(fieldCode);
      control = new FormControl<boolean>({ value: false, disabled: !differs }, { nonNullable: true });
      this.checks.set(fieldCode, control);
    }

    return control;
  }

  protected syncSelection(): void {
    this.selected.set([...this.checks.entries()].filter(([, control]) => control.value).map(([code]) => code));
  }

  protected selectAll(): void {
    for (const code of this.differing()) {
      this.checkFor(code).setValue(true);
    }

    this.syncSelection();
  }

  protected async compare(): Promise<void> {
    this.attempted.set(true);

    if (this.reason.invalid) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      this.preview.set(await this.facade.previewIcp(this.reason.value as IcpRefreshReason));
      this.step.set('compare');
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }

  protected async apply(): Promise<void> {
    const token = this.preview()?.previewToken;

    if (!token) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await this.facade.applyIcp(this.reason.value as IcpRefreshReason, token, this.selected());
      this.open.set(false);
      this.completed.emit({ message: $localize`:@@portal.admission.review.icp.done:The selected fields were updated from ICP.`, leave: false });
    } catch (error: unknown) {
      this.error.set(problemText(error));
      this.step.set('compare');
    } finally {
      this.busy.set(false);
    }
  }
}
