import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PlaygroundEntry, injectPlaygroundConfig } from '../config';

interface OverviewGroup {
  readonly name: string;
  readonly entries: readonly PlaygroundEntry[];
}

/**
 * Components overview (NG-ZORRO style): a filter field and every component group as a grid of
 * cards with the title, selector and one-line description.
 */
@Component({
  selector: 'dahc-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  styleUrl: './docs.scss',
  template: `
    <article class="pg-doc-article">
      <h1 class="pg-doc-title">Components Overview</h1>
      <p class="pg-doc-lead">
        {{ title }} provides {{ total() }} components for Dubai Health applications, grouped by purpose. Each page explains when to use the
        component, shows live examples with their code, and lists its full API.
      </p>
      <div class="pg-overview-filter">
        <label class="dahc-visually-hidden" for="pg-overview-filter">Filter components</label>
        <input
          id="pg-overview-filter"
          class="pg-search-input pg-overview-input"
          type="search"
          placeholder="Search components"
          [value]="filter()"
          (input)="onFilter($event)" />
        <p class="pg-doc-muted" role="status">{{ shown() }} of {{ total() }} components</p>
      </div>
      @for (group of groups(); track group.name) {
        <section class="pg-overview-group" [attr.aria-labelledby]="groupId(group.name)">
          <h2 class="pg-doc-h2" [id]="groupId(group.name)">
            {{ group.name }} <span class="pg-overview-count">{{ group.entries.length }}</span>
          </h2>
          <ul class="pg-overview-grid">
            @for (entry of group.entries; track entry.path) {
              <li>
                <a class="pg-overview-card" [routerLink]="'/' + entry.path">
                  <span class="pg-overview-mark" aria-hidden="true">{{ entry.title.charAt(0) }}</span>
                  <span class="pg-overview-card-title">{{ entry.title }}</span>
                  @if (entry.selector) {
                    <code class="pg-overview-selector">{{ entry.selector }}</code>
                  }
                  @if (entry.description) {
                    <span class="pg-overview-description">{{ entry.description }}</span>
                  }
                </a>
              </li>
            }
          </ul>
        </section>
      }
    </article>
  `,
})
export class OverviewPageComponent {
  private readonly config = injectPlaygroundConfig();

  protected readonly title = this.config.title;
  protected readonly filter = signal<string>('');

  private readonly componentGroups = this.config.groups.filter(group => !this.config.docsGroups.includes(group));

  protected readonly groups = computed<readonly OverviewGroup[]>(() => {
    const words = this.filter().toLowerCase().split(/\s+/).filter(word => word !== '');
    const matches = (entry: PlaygroundEntry): boolean =>
      words.every(word => `${entry.title} ${entry.selector ?? ''} ${entry.description ?? ''}`.toLowerCase().includes(word));

    return this.componentGroups
      .map(name => ({
        name,
        entries: this.config.entries
          .filter(entry => entry.group === name && matches(entry))
          .sort((first, second) => first.title.localeCompare(second.title)),
      }))
      .filter(group => group.entries.length > 0);
  });

  protected readonly total = computed<number>(
    () => this.config.entries.filter(entry => this.componentGroups.includes(entry.group)).length,
  );
  protected readonly shown = computed<number>(() => this.groups().reduce((sum, group) => sum + group.entries.length, 0));

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected groupId(name: string): string {
    return `pg-overview-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }
}
