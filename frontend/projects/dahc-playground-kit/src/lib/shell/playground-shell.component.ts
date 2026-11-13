import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DahcLogoComponent, DahcThemeSwitchComponent } from 'dahc-ui';
import { filter, map, startWith } from 'rxjs';

import { FOUNDATIONS_GROUP, OVERVIEW_PATH, PlaygroundEntry, injectPlaygroundConfig } from '../config';
import { PlaygroundSearchComponent } from '../docs/search.component';
import { playgroundEntries } from '../routes';

type Direction = 'ltr' | 'rtl';
type Section = 'docs' | 'components';

/**
 * Documentation-site chrome (NG-ZORRO style): header with brand, search, Docs / Components
 * navigation, version, theme and direction switchers; a side menu of the current section's groups;
 * and the router outlet. Place it as the only content of the app's root component.
 */
@Component({
  selector: 'dahc-playground-shell',
  templateUrl: './playground-shell.component.html',
  styleUrl: './playground-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcLogoComponent, DahcThemeSwitchComponent, PlaygroundSearchComponent, RouterLink, RouterLinkActive, RouterOutlet],
})
export class PlaygroundShellComponent {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly config = injectPlaygroundConfig();

  protected readonly entries: readonly PlaygroundEntry[] = playgroundEntries(this.config);
  protected readonly title = this.config.title;
  protected readonly version = this.config.version;
  protected readonly homePath = this.config.homePath;
  protected readonly overviewPath = OVERVIEW_PATH;
  protected readonly direction = signal<Direction>('ltr');
  protected readonly navOpen = signal<boolean>(false);

  /** Docs groups as configured, with Foundations right after the first one ("Docs"). */
  private readonly docsGroups = this.config.docsGroups.filter(
    group => group === FOUNDATIONS_GROUP || this.entries.some(entry => entry.group === group),
  );
  private readonly componentGroups = this.config.groups.filter(group => !this.config.docsGroups.includes(group));

  protected readonly docsHome =
    this.entries.find(entry => entry.group === this.docsGroups[0])?.path ?? this.config.homePath;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: '' },
  );

  protected readonly section = computed<Section>(() => {
    const path = this.url().split(/[?#]/)[0]?.replace(/^\//, '') ?? '';
    const entry = this.entries.find(item => item.path === path);

    return entry && this.docsGroups.includes(entry.group) ? 'docs' : 'components';
  });

  protected readonly visibleGroups = computed<readonly string[]>(() =>
    this.section() === 'docs' ? this.docsGroups : this.componentGroups,
  );

  protected entriesIn(group: string): readonly PlaygroundEntry[] {
    const entries = this.entries.filter(entry => entry.group === group);

    return this.section() === 'components' ? [...entries].sort((first, second) => first.title.localeCompare(second.title)) : entries;
  }

  protected groupId(group: string): string {
    return `pg-nav-${group.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  protected toggleDirection(): void {
    const next: Direction = this.direction() === 'ltr' ? 'rtl' : 'ltr';
    this.direction.set(next);
    this.document.documentElement.dir = next;
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.document.getElementById('main-content')?.focus();
  }
}
