import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcBadgeComponent, DahcBadgeTone } from 'dahc-ui';

import { InspectorChoiceComponent } from '../inspector/inspector-choice.component';
import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-badge-page',
  templateUrl: './badge-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcBadgeComponent, InspectorChoiceComponent, InspectorTextComponent, PlaygroundPageComponent],
})
export class BadgePageComponent {
  protected readonly sourceFiles = ['badge/badge.component.ts', 'badge/badge.component.html', 'badge/badge.component.scss'];
  protected readonly tones: readonly DahcBadgeTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];

  protected readonly tone = signal<DahcBadgeTone>('success');
  protected readonly text = signal<string>('Review completed');
}
