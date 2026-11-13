import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DahcHeadingLevel = 2 | 3;

/** Explains why a list or area is empty and offers the next action through projected content. */
@Component({
  selector: 'dahc-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DahcEmptyStateComponent {
  readonly heading = input.required<string>();
  readonly description = input<string>('');
  readonly headingLevel = input<DahcHeadingLevel>(2);
}
