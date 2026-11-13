import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcAnchorComponent, DahcAnchorLinkComponent } from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-anchor-page',
  templateUrl: './anchor-page.component.html',
  styles: `
    .anchor-demo { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--dahc-space-6); }
    @media (min-width: 48rem) { .anchor-demo { grid-template-columns: 12rem minmax(0, 1fr); } }
    .anchor-scroller { max-block-size: 18rem; overflow-y: auto; padding: var(--dahc-space-4); border: var(--dahc-size-border) solid var(--dahc-color-border-subtle); border-radius: var(--dahc-radius-md); }
    .anchor-scroller section { min-block-size: 12rem; }
    .anchor-scroller h3 { margin-block: 0 var(--dahc-space-2); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAnchorComponent, DahcAnchorLinkComponent, DocExampleComponent, EventLogComponent, PlaygroundPageComponent],
})
export class AnchorPageComponent {
  protected readonly whenToUse = [
    'Help readers move around a long page, such as program details or a long guide.',
    'Show where the reader is in the page while they scroll.',
    'Use container when the sections scroll inside a box instead of the window.',
    'Give each anchor its own label when a page has more than one.',
  ];

  protected readonly sourceFiles = [
    'navigation/anchor/anchor.component.ts',
    'navigation/anchor/anchor.component.html',
    'navigation/anchor/anchor-link.component.html',
    'navigation/anchor/anchor-link.component.css',
  ];
  protected readonly current = signal<string>('');
  protected readonly events = signal<readonly string[]>([]);

  protected record(href: string): void {
    this.events.update(events => [`currentChange (${href})`, ...events]);
  }
}
