import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DahcFileUploadComponent, DahcFileUploadValue } from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { AttachmentsApiService } from '../../../api/attachments-api.service';
import { AttachmentSectionKey, AttachmentSlot } from '../../../api/candidate-lifecycle.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { DAHC_CALLER_HANDLES_PROBLEMS } from '../../../core/api/api-request';
import { WizardStateService } from './wizard-state.service';

interface SlotView {
  readonly slot: AttachmentSlot;
  readonly control: FormControl<DahcFileUploadValue>;
  readonly accept: string;
  readonly hint: string;
}

/**
 * The document slots of one section (the server decides which apply, CJ-20): upload or replace,
 * preview and remove, with the slot's type and size limits. Files upload as soon as they are chosen.
 */
@Component({
  selector: 'dahc-section-attachments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFileUploadComponent, ReactiveFormsModule],
  styles: `
    :host { display: grid; gap: var(--dahc-space-5); }
    .attachments-heading { margin: 0; font-size: var(--dahc-type-heading-4-size); line-height: var(--dahc-type-heading-4-line-height); font-weight: var(--dahc-type-heading-4-weight); }
  `,
  template: `
    @if (heading() !== '' && views().length > 0) {
      <h3 class="attachments-heading">{{ heading() }}</h3>
    }
    @for (view of views(); track view.slot.slotId) {
      <dahc-file-upload
        [formControl]="view.control"
        [label]="view.slot.label"
        [hint]="view.hint"
        [accept]="view.accept"
        [maxSize]="view.slot.maxFileSizeBytes"
        [required]="view.slot.required"
        [disabled]="!view.slot.editable || !state.editable()"
        [progress]="busySlot() === view.slot.slotId ? 50 : null"
        [invalid]="errorFor(view.slot) !== ''"
        [errorMessage]="errorFor(view.slot)"
        (fileSelected)="upload(view, $event)"
        (fileRemoved)="remove(view)"
        (previewRequested)="preview(view.slot)" />
    }
  `,
})
export class SectionAttachmentsComponent {
  private readonly api = inject(AttachmentsApiService);
  private readonly document = inject(DOCUMENT);
  private readonly errors = signal<Readonly<Record<string, string>>>({});
  private readonly controls = new Map<string, FormControl<DahcFileUploadValue>>();

  protected readonly state = inject(WizardStateService);
  protected readonly busySlot = signal<string | null>(null);

  readonly sectionKey = input.required<AttachmentSectionKey>();
  /** Only the evidence of one portfolio question. */
  readonly portfolioQuestionId = input<string | null>(null);
  readonly heading = input<string>('');
  /** Shows "required" errors for empty slots (after the step was checked). */
  readonly showRequired = input<boolean>(false);

  protected readonly views = computed<readonly SlotView[]>(() =>
    this.state
      .slots()
      .filter(slot => slot.sectionKey === this.sectionKey())
      .filter(slot => this.portfolioQuestionId() === null || slot.portfolioQuestionId === this.portfolioQuestionId())
      .map(slot => ({ slot, control: this.controlFor(slot), accept: slot.allowedMediaTypes.join(','), hint: this.hintFor(slot) })),
  );

  protected errorFor(slot: AttachmentSlot): string {
    const error = this.errors()[slot.slotId];

    if (error) {
      return error;
    }

    return this.showRequired() && slot.required && slot.attachment === null
      ? $localize`:@@portal.attachments.required:Upload this document.`
      : '';
  }

  protected async upload(view: SlotView, file: File): Promise<void> {
    const application = this.state.application();

    if (!application) {
      return;
    }

    this.setError(view.slot.slotId, '');
    this.busySlot.set(view.slot.slotId);

    try {
      const context = new HttpContext().set(DAHC_CALLER_HANDLES_PROBLEMS, true);
      const result = await firstValueFrom(this.api.upload(application.id, view.slot.slotId, file, context));
      this.state.replaceSlot({ ...view.slot, attachment: result.data });
      view.control.setValue({ name: result.data.fileName, size: result.data.sizeBytes }, { emitEvent: false });
    } catch (error: unknown) {
      view.control.setValue(this.uploaded(view.slot), { emitEvent: false });
      this.setError(
        view.slot.slotId,
        isApiProblemError(error) ? (error.problem.detail ?? error.problem.title) : $localize`:@@portal.attachments.failed:The file could not be uploaded. Try again.`,
      );
    } finally {
      this.busySlot.set(null);
    }
  }

  protected async remove(view: SlotView): Promise<void> {
    const application = this.state.application();

    if (!application) {
      return;
    }

    try {
      const result = await firstValueFrom(this.api.remove(application.id, view.slot.slotId));
      this.state.replaceSlot(result.data);
      this.setError(view.slot.slotId, '');
    } catch {
      // The API problem is shown in the page message area; keep the file shown.
      view.control.setValue(this.uploaded(view.slot), { emitEvent: false });
    }
  }

  protected async preview(slot: AttachmentSlot): Promise<void> {
    const application = this.state.application();
    const view = this.document.defaultView;

    if (!application || !view) {
      return;
    }

    // Open the tab synchronously so pop-up blockers allow it, then load the file into it.
    const tab = view.open('', '_blank');
    const blob = await firstValueFrom(this.api.download(application.id, slot.slotId));
    const url = URL.createObjectURL(blob);

    if (tab) {
      tab.location.href = url;
    } else {
      view.open(url, '_blank', 'noopener');
    }

    view.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  private controlFor(slot: AttachmentSlot): FormControl<DahcFileUploadValue> {
    let control = this.controls.get(slot.slotId);

    if (!control) {
      control = new FormControl<DahcFileUploadValue>(null);
      this.controls.set(slot.slotId, control);
    }

    if (this.busySlot() !== slot.slotId) {
      control.setValue(this.uploaded(slot), { emitEvent: false });
    }

    return control;
  }

  private uploaded(slot: AttachmentSlot): DahcFileUploadValue {
    return slot.attachment ? { name: slot.attachment.fileName, size: slot.attachment.sizeBytes } : null;
  }

  private hintFor(slot: AttachmentSlot): string {
    const types = slot.allowedMediaTypes.map(type => (type === 'application/pdf' ? 'PDF' : type.replace('image/', '').toUpperCase())).join(', ');
    const size = Math.round(slot.maxFileSizeBytes / 1024 / 1024);

    return $localize`:@@portal.attachments.limits:${types}:types: · max ${size}:size: MB`;
  }

  private setError(slotId: string, message: string): void {
    this.errors.update(errors => ({ ...errors, [slotId]: message }));
  }
}
