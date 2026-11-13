import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DahcTimelineStatus = 'done' | 'current' | 'pending' | 'error';

/**
 * Events in time order, as a list. Items are dahc-timeline-item children.
 * DERIVED. Ported from dubai-health-ui dh-timeline.
 */
@Component({
  selector: 'dahc-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styles: ':host { display: block; }',
  host: {
    class: 'dahc-timeline',
    role: 'list',
    '[attr.aria-label]': "label() || null",
  },
})
export class DahcTimelineComponent {
  readonly label = input<string>('');
}

/**
 * One event: a status dot on the line, a bold heading, an optional time and projected details.
 * The status is also given in text for screen readers (done navy, current white with a halo,
 * pending outlined, error red).
 * Ported from dubai-health-ui dh-timeline-item.
 */
@Component({
  selector: 'dahc-timeline-item',
  styleUrl: './timeline-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-timeline-item dahc-timeline-item--' + status()",
    role: 'listitem',
    '[attr.aria-current]': "status() === 'current' ? 'step' : null",
  },
  template: `
    <span class="dahc-timeline-item__dot" aria-hidden="true"></span>
    <div class="dahc-timeline-item__content">
      <p class="dahc-timeline-item__head">
        <span class="dahc-timeline-item__heading">{{ heading() }}</span>
        <span class="dahc-visually-hidden">({{ statusText() }})</span>
        @if (time() !== '') {
          <time class="dahc-timeline-item__time" [attr.datetime]="datetime() || null">{{ time() }}</time>
        }
      </p>
      <div class="dahc-timeline-item__body"><ng-content /></div>
    </div>
  `,
})
export class DahcTimelineItemComponent {
  readonly heading = input.required<string>();
  /** Time as shown. */
  readonly time = input<string>('');
  /** Machine-readable time (ISO 8601). */
  readonly datetime = input<string>('');
  readonly status = input<DahcTimelineStatus>('done');
  readonly statusLabels = input<Readonly<Record<DahcTimelineStatus, string>>>({
    done: $localize`:@@dahcUi.timeline.done:Completed`,
    current: $localize`:@@dahcUi.timeline.current:In progress`,
    pending: $localize`:@@dahcUi.timeline.pending:Not started`,
    error: $localize`:@@dahcUi.timeline.error:Needs attention`,
  });

  protected readonly statusText = computed<string>(() => this.statusLabels()[this.status()]);
}
