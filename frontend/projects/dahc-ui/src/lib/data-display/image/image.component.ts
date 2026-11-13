import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcDialogBase } from '../../feedback/dialog/dialog-base';

export type DahcImageRadius = 'none' | 'md' | 'lg';

/** Full-size preview of a dahc-image in a native modal dialog (Escape, backdrop and × close). */
@Component({
  selector: 'dahc-image-preview',
  styleUrl: './image-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  template: `
    <dialog #dialog class="dahc-image-preview" [attr.aria-label]="heading()" (cancel)="onCancel($event)">
      <img class="dahc-image-preview__image" [src]="src()" [alt]="alt()" />
      <button type="button" class="dahc-image-preview__close" (click)="requestClose('close-button')">
        <dahc-icon name="x-close" size="lg" />
        <span class="dahc-visually-hidden">{{ closeLabel() }}</span>
      </button>
    </dialog>
  `,
})
export class DahcImagePreviewComponent extends DahcDialogBase {
  readonly src = input<string>('');
  readonly alt = input<string>('');
}

/**
 * An image with optional full-size preview: with preview set the image is a button ("View larger:
 * <alt>") that opens it in a modal dialog. Radius lg 16 (DH cards), md 8, none.
 * PARTIAL: DH image overlay guidance (Figma 50:6676); preview DERIVED.
 * Ported from dubai-health-ui dh-image.
 */
@Component({
  selector: 'dahc-image',
  styleUrl: './image.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcImagePreviewComponent],
  host: {
    '[class]': "'dahc-image dahc-image--radius-' + radius()",
  },
  template: `
    @if (preview()) {
      <button type="button" class="dahc-image__open" [attr.aria-label]="openLabel()" (click)="open.set(true)">
        <img class="dahc-image__image" [src]="src()" [alt]="alt()" loading="lazy" />
      </button>
      <dahc-image-preview [src]="src()" [alt]="alt()" [heading]="alt()" [closeLabel]="closeLabel()" [(open)]="open" />
    } @else {
      <img class="dahc-image__image" [src]="src()" [alt]="alt()" loading="lazy" />
    }
  `,
})
export class DahcImageComponent {
  readonly src = input.required<string>();
  /** Text alternative; empty only for decorative images. */
  readonly alt = input<string>('');
  /** Opens a full-size preview when the image is activated. */
  readonly preview = input<boolean>(false);
  readonly radius = input<DahcImageRadius>('lg');
  readonly viewLargerLabel = input<string>($localize`:@@dahcUi.image.viewLarger:View larger`);
  readonly closeLabel = input<string>($localize`:@@dahcUi.image.close:Close preview`);

  protected readonly open = signal<boolean>(false);
  protected readonly openLabel = computed<string>(() => (this.alt() ? `${this.viewLargerLabel()}: ${this.alt()}` : this.viewLargerLabel()));
}
