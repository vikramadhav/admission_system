import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcAffixComponent, DahcButtonComponent, DahcSpaceComponent, DahcTagComponent } from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-affix-page',
  templateUrl: './affix-page.component.html',
  styles: `
    .affix-bar { padding: var(--dahc-space-3); border-radius: var(--dahc-radius-md); background-color: var(--dahc-color-surface); }
    .affix-filler { margin: 0; color: var(--dahc-color-text-secondary); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAffixComponent,
    DahcButtonComponent,
    DahcSpaceComponent,
    DahcTagComponent,
    DocExampleComponent,
    EventLogComponent,
    PlaygroundPageComponent,
  ],
})
export class AffixPageComponent {
  protected readonly whenToUse = [
    'Keep the actions of a long form (Save, Back) in reach while the candidate scrolls.',
    'Keep a filter bar above a long list of applications visible.',
    'Use offsetTop to sit below a fixed header, so the two never overlap.',
    'Keep pinned content small: it must never cover the field that has keyboard focus (WCAG 2.4.11).',
  ];

  protected readonly sourceFiles = ['layout/affix/affix.component.ts', 'layout/affix/affix.component.css'];

  protected readonly fillers = Array.from({ length: 12 }, (_, index) => index + 1);
  protected readonly events = signal<readonly string[]>([]);

  protected onAffixed(affixed: boolean): void {
    this.events.update(events => [`affixedChange (${affixed})`, ...events].slice(0, 5));
  }
}
