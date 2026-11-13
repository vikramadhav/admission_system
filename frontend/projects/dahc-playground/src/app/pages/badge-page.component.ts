import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcBadgeComponent, DahcBadgeTone, DahcIconButtonComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-badge-page',
  templateUrl: './badge-page.component.html',
  styles: '.badge-anchor { position: relative; display: inline-flex; } .badge-anchor dahc-badge { position: absolute; inset-block-start: 0; inset-inline-end: 0; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcBadgeComponent, DahcIconButtonComponent, InspectorChoiceComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent],
})
export class BadgePageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show an unread or pending count on an icon button or menu item, such as notifications.',
    'Use a dot when something is new but the number does not matter.',
    'Use Tag for a status label such as Draft or Submitted, and Statistic for numbers in content.',
    'Always set label to say what the number counts; the digits themselves are hidden from screen readers.',
  ];

  protected readonly sourceFiles = ['data-display/badge/badge.component.ts', 'data-display/badge/badge.component.css'];
  protected readonly tones: readonly DahcBadgeTone[] = ['alert', 'primary'];
  protected readonly counts: readonly string[] = ['3', '0', '12', '150'];

  protected readonly count = signal<string>('3');
  protected readonly tone = signal<DahcBadgeTone>('alert');
  protected readonly dot = signal<boolean>(false);
  protected readonly label = signal<string>('3 unread notifications');
}
