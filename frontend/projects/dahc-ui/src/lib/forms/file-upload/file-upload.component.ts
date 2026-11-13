import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  LOCALE_ID,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcButtonComponent } from '../../actions/button/button.component';
import { DahcIconButtonComponent } from '../../actions/icon-button/icon-button.component';
import { DahcTagComponent } from '../../data-display/tag/tag.component';

/** A file the server already holds, for example when a draft is reopened. */
export interface DahcUploadedFile {
  readonly name: string;
  /** Size in bytes. */
  readonly size: number;
  readonly url?: string;
}

export type DahcFileUploadValue = File | DahcUploadedFile | null;

/**
 * One document slot: choose or drop a file, see it as an uploaded row, preview or remove it.
 * The form value is the chosen File, a DahcUploadedFile for a file already on the server, or null.
 * Files that do not match accept or exceed maxSize are refused with a message and never reach the
 * form. Uploading is the app's job: listen to valueChange / (fileSelected) and set [progress].
 * GME upload slot (1:3604): dashed 2px navy-600 box, radius 10, "Choose file" outline pill;
 * uploaded row (1:4900): Uploaded tag, file name and size, Preview, delete. Drag-over, progress
 * and error states are DERIVED, pending UX sign-off.
 */
@Component({
  selector: 'dahc-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcButtonComponent, DahcIconButtonComponent, DahcIconComponent, DahcTagComponent],
  providers: [provideDahcValueAccessor(() => DahcFileUploadComponent)],
})
export class DahcFileUploadComponent extends DahcFormControl<DahcFileUploadValue> {
  readonly label = input.required<string>();
  /** Allowed types and size in words, for example "PDF, JPG or PNG, up to 5 MB". */
  readonly hint = input<string>('');
  /** Same syntax as the native accept attribute: ".pdf,.jpg,image/png". */
  readonly accept = input<string>('');
  /** Largest allowed file in bytes; 0 for no limit. */
  readonly maxSize = input<number>(0);
  readonly required = input<boolean>(false);
  /** Error from the app, for example a failed upload; shown with [invalid]. */
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  /** Upload progress 0-100 while the app uploads; null hides the bar. */
  readonly progress = input<number | null>(null);
  readonly chooseLabel = input<string>($localize`:@@dahcUi.upload.choose:Choose file`);
  readonly dropLabel = input<string>($localize`:@@dahcUi.upload.drop:or drop it here`);
  readonly emptyLabel = input<string>($localize`:@@dahcUi.upload.empty:No file chosen`);
  readonly uploadedLabel = input<string>($localize`:@@dahcUi.upload.uploaded:Uploaded`);
  readonly previewLabel = input<string>($localize`:@@dahcUi.upload.preview:Preview`);
  readonly removeLabel = input<string>($localize`:@@dahcUi.upload.remove:Remove file`);
  readonly typeErrorMessage = input<string>($localize`:@@dahcUi.upload.type:This file type is not allowed.`);
  readonly sizeErrorMessage = input<string>($localize`:@@dahcUi.upload.size:This file is too large.`);
  readonly progressLabel = input<string>($localize`:@@dahcUi.upload.progress:Uploading`);

  /** The user chose a valid file. */
  readonly fileSelected = output<File>();
  readonly previewRequested = output<NonNullable<DahcFileUploadValue>>();
  readonly fileRemoved = output<void>();

  protected readonly groupId = dahcUniqueId('dahc-file-upload');
  protected readonly labelId = `${this.groupId}-label`;
  protected readonly messageId = `${this.groupId}-message`;
  protected readonly dragging = signal<boolean>(false);
  private readonly rejection = signal<string>('');

  protected readonly message = computed<{ readonly text: string; readonly error: boolean }>(() => {
    if (this.rejection()) {
      return { text: this.rejection(), error: true };
    }

    if (this.invalid() && this.errorMessage()) {
      return { text: this.errorMessage(), error: true };
    }

    return { text: this.hint(), error: false };
  });

  protected readonly fileName = computed<string>(() => this.value()?.name ?? '');
  protected readonly fileSize = computed<string>(() => this.formatSize(this.value()?.size ?? 0));

  private readonly locale = inject(LOCALE_ID);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected emptyValue(): DahcFileUploadValue {
    return null;
  }

  protected choose(): void {
    this.fileInput().nativeElement.click();
  }

  protected onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (file) {
      this.takeFile(file);
    }

    this.markTouched();
  }

  protected onDragOver(event: DragEvent): void {
    if (this.isDisabled()) {
      return;
    }

    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];

    if (file && !this.isDisabled()) {
      this.takeFile(file);
      this.markTouched();
    }
  }

  protected preview(): void {
    const value = this.value();

    if (value) {
      this.previewRequested.emit(value);
    }
  }

  protected remove(): void {
    this.rejection.set('');
    this.commitValue(null);
    this.fileRemoved.emit();
    this.markTouched();
  }

  private takeFile(file: File): void {
    if (!this.matchesAccept(file)) {
      this.rejection.set(this.typeErrorMessage());

      return;
    }

    if (this.maxSize() > 0 && file.size > this.maxSize()) {
      this.rejection.set(this.sizeErrorMessage());

      return;
    }

    this.rejection.set('');
    this.commitValue(file);
    this.fileSelected.emit(file);
  }

  /** Same rules as the native accept attribute: extensions, exact types and type/* wildcards. */
  private matchesAccept(file: File): boolean {
    const rules = this.accept()
      .split(',')
      .map(rule => rule.trim().toLowerCase())
      .filter(rule => rule !== '');

    if (rules.length === 0) {
      return true;
    }

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    return rules.some(rule => {
      if (rule.startsWith('.')) {
        return name.endsWith(rule);
      }

      if (rule.endsWith('/*')) {
        return type.startsWith(rule.slice(0, -1));
      }

      return type === rule;
    });
  }

  private formatSize(bytes: number): string {
    const [value, unit] = bytes >= 1024 * 1024 ? [bytes / (1024 * 1024), 'megabyte'] : [bytes / 1024, 'kilobyte'];

    return new Intl.NumberFormat(this.locale, { style: 'unit', unit, maximumFractionDigits: 1 }).format(value);
  }
}
