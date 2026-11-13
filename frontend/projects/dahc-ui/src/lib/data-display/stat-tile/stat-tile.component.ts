import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Category colour of the tile (DH secondary tints). */
export type DahcStatTileColor = 'blue' | 'light-blue' | 'green' | 'orange' | 'red' | 'purple' | 'pink';

/**
 * A highlighted number with its label, for example the GME dashboard score tiles
 * (Portfolio, Entrance exam, GPA, Shortlisting). An empty value shows "—" and is read as
 * "Not available". GME score tiles (GME 1:1938): radius 12, padding 14, category tint, value Bold
 * 24/30; DH "Stats" text style for the large size (Bold 36 mobile / 60 web, uppercase).
 * Ported in part from dubai-health-ui (display/dh-data-display.ts, DhStatistic).
 */
@Component({
  selector: 'dahc-stat-tile',
  templateUrl: './stat-tile.component.html',
  styleUrl: './stat-tile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-stat-tile dahc-stat-tile--' + color() + (large() ? ' dahc-stat-tile--large' : '')",
  },
})
export class DahcStatTileComponent {
  readonly label = input.required<string>();
  /** The value as display text ("87", "3.6 / 4"); empty when not available yet. */
  readonly value = input<string>('');
  /** Short note under the value, for example "Announced 12 Mar 2026". */
  readonly caption = input<string>('');
  readonly color = input<DahcStatTileColor>('blue');
  /** Uses the DH Stats text style for a headline figure. */
  readonly large = input<boolean>(false);
  readonly emptyLabel = input<string>($localize`:@@dahcUi.statTile.empty:Not available`);
}
