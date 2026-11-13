import { ChangeDetectionStrategy, Component, effect, inject, input, model, output, signal } from '@angular/core';
import { DahcAlertComponent, DahcButtonComponent, DahcModalComponent, DahcToastService } from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { ApplicationsApiService } from '../../../api/applications-api.service';
import { actionProblemText } from './action-support';
import { callerHandlesProblems } from '../../../core/api/api-request';

/** Confirms discarding a draft (US-1.2.3). Cancelling keeps the draft; a discarded draft becomes Archived. */
@Component({
  selector: 'dahc-discard-draft-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcModalComponent],
  styleUrl: './actions.scss',
  template: `
    <dahc-modal [(open)]="open" size="sm" i18n-heading="@@portal.discard.heading" heading="Discard this draft?">
      <div class="action-form">
        <p class="action-text" i18n="@@portal.discard.text">
          Application {{ applicationNumber() }} and everything you entered in it will be discarded. You cannot undo this, but you can
          start a new application afterwards.
        </p>
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </div>
      <div dahcDialogFooter class="action-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.discard.keep">Keep draft</button>
        <button dahc-button type="button" variant="danger" [loading]="busy()" (click)="confirm()" i18n="@@portal.discard.confirm">
          Discard draft
        </button>
      </div>
    </dahc-modal>
  `,
})
export class DiscardDraftDialogComponent {
  private readonly applicationsApi = inject(ApplicationsApiService);
  private readonly toasts = inject(DahcToastService);

  readonly applicationId = input.required<string>();
  readonly applicationNumber = input<string>('');
  readonly open = model<boolean>(false);
  readonly completed = output<void>();

  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');

  constructor() {
    effect(() => {
      if (this.open()) {
        this.error.set('');
      }
    });
  }

  protected async confirm(): Promise<void> {
    this.busy.set(true);
    this.error.set('');

    try {
      await firstValueFrom(this.applicationsApi.discardDraft(this.applicationId(), callerHandlesProblems()));
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.discard.done:Your draft was discarded.`,
      });
      this.open.set(false);
      this.completed.emit();
    } catch (error: unknown) {
      this.error.set(actionProblemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
