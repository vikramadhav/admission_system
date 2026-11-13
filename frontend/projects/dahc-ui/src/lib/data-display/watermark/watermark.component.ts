import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, inject, input, viewChild } from '@angular/core';

import { DahcThemeService } from '../../core/theme/theme.service';

function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, character => `&#${character.charCodeAt(0)};`);
}

/**
 * Repeats a faint text mark over its projected content ("Confidential", a candidate number). The
 * mark is decorative (hidden from assistive technology) and never blocks interaction; it is a
 * deterrent, not a security control. Use "|" in the content for a second line. The colour is the
 * primary text colour at 12% and follows the theme. DERIVED (DH navy at 12%, Dubai font).
 * Ported from dubai-health-ui dh-watermark.
 */
@Component({
  selector: 'dahc-watermark',
  styleUrl: './watermark.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dahc-watermark' },
  template: `
    <ng-content />
    <div #mark class="dahc-watermark__mark" aria-hidden="true"></div>
  `,
})
export class DahcWatermarkComponent {
  private readonly theme = inject(DahcThemeService);
  private readonly mark = viewChild.required<ElementRef<HTMLElement>>('mark');

  /** Mark text; "|" starts a second line. */
  readonly content = input<string>('');
  /** Angle in degrees. */
  readonly rotate = input<number>(-22);
  /** Font size in px. */
  readonly fontSize = input<number>(14);

  constructor() {
    afterRenderEffect(() => {
      this.theme.theme();
      this.paint(this.mark().nativeElement, this.content(), this.rotate(), this.fontSize());
    });
  }

  /** Builds the repeating SVG tile from the current colour and font and sets it as the background. */
  private paint(mark: HTMLElement, content: string, rotate: number, fontSize: number): void {
    const lines = content
      .split('|')
      .map(line => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      mark.style.backgroundImage = '';

      return;
    }

    const style = getComputedStyle(mark);
    const gap = fontSize * 7;
    const width = Math.max(...lines.map(line => line.length)) * fontSize * 0.6 + gap;
    const height = lines.length * fontSize * 1.4 + gap;
    const text = lines.map((line, index) => `<tspan x="50%" dy="${index ? 1.4 : 0}em">${escapeXml(line)}</tspan>`).join('');
    const tile =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="${escapeXml(style.color)}" ` +
      `font-family="${escapeXml(style.fontFamily)}" font-size="${fontSize}" transform="rotate(${rotate} ${width / 2} ${height / 2})">` +
      `${text}</text></svg>`;
    mark.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(tile)}")`;
  }
}
