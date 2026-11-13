import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Gap from the DH space scale: sm 8px, md 16px, lg 24px. */
export type DahcFlexGap = 'none' | 'sm' | 'md' | 'lg';
export type DahcFlexJustify = '' | 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type DahcFlexAlign = '' | 'start' | 'center' | 'end' | 'baseline' | 'stretch';

/** Host classes shared by the flex-based layout helpers. */
export function dahcFlexClasses(
  vertical: boolean,
  wrap: boolean,
  gap: DahcFlexGap | null,
  justify: DahcFlexJustify,
  align: DahcFlexAlign,
): string {
  return [
    vertical ? 'dahc-flex--vertical' : '',
    wrap ? 'dahc-flex--wrap' : '',
    gap ? `dahc-flex--gap-${gap}` : '',
    justify ? `dahc-flex--justify-${justify}` : '',
    align ? `dahc-flex--align-${align}` : '',
  ]
    .filter(name => name !== '')
    .join(' ');
}

/**
 * Flexible box layout helper: a row (or a column with `vertical`) with a gap from the DH space
 * scale. Set `--dahc-flex-gap` for any other length.
 * Ported from dubai-health-ui dh-flex (layout/dh-layout.ts). DERIVED: DH spacing tokens.
 */
@Component({
  selector: 'dahc-flex',
  template: '<ng-content />',
  styleUrls: ['./flex-alignment.css', './flex.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-flex ' + classes()",
  },
})
export class DahcFlexComponent {
  readonly vertical = input<boolean>(false);
  readonly wrap = input<boolean>(false);
  readonly gap = input<DahcFlexGap>('md');
  readonly justify = input<DahcFlexJustify>('');
  readonly align = input<DahcFlexAlign>('');

  protected classes(): string {
    return dahcFlexClasses(this.vertical(), this.wrap(), this.gap(), this.justify(), this.align());
  }
}
