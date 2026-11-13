import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcBackTopComponent } from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-back-top-page',
  templateUrl: './back-top-page.component.html',
  styles: `
    .back-top-scroller { position: relative; max-block-size: 16rem; overflow-y: auto; padding: var(--dahc-space-4); border: var(--dahc-size-border) solid var(--dahc-color-border-subtle); border-radius: var(--dahc-radius-md); }
    .back-top-content { min-block-size: 48rem; margin: 0; }
    .back-top-sticky { position: sticky; inset-block-end: 0; display: flex; justify-content: flex-end; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcBackTopComponent, DocExampleComponent, EventLogComponent, PlaygroundPageComponent],
})
export class BackTopPageComponent {
  protected readonly whenToUse = [
    'Long pages such as guides, terms and conditions or long lists.',
    'Scroll containers with a lot of content, using target.',
    'Choose visibilityHeight so the button appears once the top is out of view.',
    'It complements, not replaces, the Home key and a short page structure.',
  ];

  protected readonly sourceFiles = [
    'navigation/float-button/float-button.component.ts',
    'navigation/float-button/back-top.component.html',
    'navigation/float-button/float-button.component.css',
  ];
  protected readonly events = signal<readonly string[]>([]);

  protected record(): void {
    this.events.update(events => ['backToTop', ...events]);
  }
}
