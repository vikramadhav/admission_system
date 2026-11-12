import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DahcThemeSwitchComponent } from 'dahc-ui';

import { PLAYGROUND_ENTRIES } from './app.routes';

type Direction = 'ltr' | 'rtl';

/** Playground shell: component navigation, theme and direction switchers, and the component page. */
@Component({
  selector: 'dahc-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcThemeSwitchComponent, RouterLink, RouterLinkActive, RouterOutlet],
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);

  protected readonly entries = PLAYGROUND_ENTRIES;
  protected readonly direction = signal<Direction>('ltr');

  protected toggleDirection(): void {
    const next: Direction = this.direction() === 'ltr' ? 'rtl' : 'ltr';
    this.direction.set(next);
    this.document.documentElement.dir = next;
  }
}
