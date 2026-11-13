import { ChangeDetectionStrategy, Component, Directive, computed, input } from '@angular/core';

import { DahcQrEcl, dahcEncodeQr } from './qr-encoder';

/** Marks the logo projected into a dahc-qr-code and keeps it inside the centre tile. */
@Directive({
  selector: '[dahcQrIcon]',
  host: {
    '[style.max-inline-size]': 'fit',
    '[style.max-block-size]': 'fit',
  },
})
export class DahcQrIconDirective {
  /** The logo may use the whole centre tile, never more. */
  protected readonly fit = '100%';
}

/**
 * Renders text or a URL as a QR code (SVG), encoded in the browser (no network). Dark modules on
 * a light card with the 4-module quiet zone scanners need, in every theme. Use ecl "H" when a
 * logo is projected into [dahcQrIcon] (keep it under about 20% of the code). An image named
 * "QR code: <value>" unless a label is given. DERIVED (DH navy modules on a white card, 160px).
 * Ported from dubai-health-ui dh-qr-code.
 */
@Component({
  selector: 'dahc-qr-code',
  styleUrl: './qr-code.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-qr-code',
    role: 'img',
    '[attr.aria-label]': 'accessibleName()',
    '[style.--_size]': "size() ? size() + 'px' : null",
  },
  template: `
    @if (matrix().length > 0) {
      <svg class="dahc-qr-code__svg" [attr.viewBox]="viewBox()" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
        <rect class="dahc-qr-code__light" [attr.width]="total()" [attr.height]="total()" />
        <path class="dahc-qr-code__dark" [attr.d]="path()" />
      </svg>
    }
    <span class="dahc-qr-code__icon"><ng-content select="[dahcQrIcon]" /></span>
  `,
})
export class DahcQrCodeComponent {
  /** Text or URL to encode. */
  readonly value = input<string>('');
  /** Error correction level. */
  readonly ecl = input<DahcQrEcl>('M');
  /** Size in px; 0 uses the default (160). */
  readonly size = input<number>(0);
  /** Accessible name; defaults to "QR code: <value>". */
  readonly label = input<string>('');
  readonly qrCodeLabel = input<string>($localize`:@@dahcUi.qrCode.label:QR code`);

  protected readonly matrix = computed<boolean[][]>(() => {
    const value = this.value();

    if (value === '') {
      return [];
    }

    try {
      return dahcEncodeQr(value, this.ecl());
    } catch {
      // Too long for a QR code: nothing is drawn.
      return [];
    }
  });

  protected readonly total = computed<number>(() => this.matrix().length + 8);
  protected readonly viewBox = computed<string>(() => `0 0 ${this.total()} ${this.total()}`);
  protected readonly path = computed<string>(() => {
    let d = '';
    this.matrix().forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) {
          d += `M${x + 4} ${y + 4}h1v1h-1z`;
        }
      }),
    );

    return d;
  });

  protected readonly accessibleName = computed<string>(() => {
    if (this.label() !== '') {
      return this.label();
    }

    return this.value() !== '' ? `${this.qrCodeLabel()}: ${this.value()}` : this.qrCodeLabel();
  });
}
