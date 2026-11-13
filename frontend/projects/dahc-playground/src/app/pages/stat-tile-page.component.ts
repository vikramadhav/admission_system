import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcStatTileColor, DahcStatTileComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-stat-tile-page',
  templateUrl: './stat-tile-page.component.html',
  styles: '.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(10rem, 100%), 1fr)); gap: var(--dahc-space-3); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcStatTileComponent, InspectorChoiceComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent],
})
export class StatTilePageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Highlight a few key numbers on a dashboard, such as the scores of an application.',
    'Use colour to group related numbers, never as the only meaning; the label says what the number is.',
    'Use Statistic for numbers in plain content without a tinted tile.',
    'Leave value empty while a number is not available; the tile shows a dash and reads "Not available".',
  ];

  protected readonly sourceFiles = [
    'data-display/stat-tile/stat-tile.component.ts',
    'data-display/stat-tile/stat-tile.component.html',
    'data-display/stat-tile/stat-tile.component.css',
  ];
  protected readonly colors: readonly DahcStatTileColor[] = ['blue', 'light-blue', 'green', 'orange', 'red', 'purple', 'pink'];

  protected readonly label = signal<string>('Portfolio score');
  protected readonly value = signal<string>('42 / 60');
  protected readonly caption = signal<string>('Announced 12 March 2026');
  protected readonly color = signal<DahcStatTileColor>('orange');
  protected readonly large = signal<boolean>(false);
}
