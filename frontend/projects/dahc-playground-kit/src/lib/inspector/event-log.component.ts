import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Lists the outputs a component emitted in the preview, newest first. */
@Component({
  selector: 'dahc-event-log',
  template: `
    <p class="pg-inspector-label">Outputs</p>
    <ol class="pg-event-log" aria-live="polite" aria-label="Emitted outputs">
      @for (event of events(); track $index) {
        <li class="pg-value">{{ event }}</li>
      } @empty {
        <li class="pg-value">No output emitted yet</li>
      }
    </ol>
  `,
  styleUrl: './inspector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLogComponent {
  readonly events = input.required<readonly string[]>();
}
