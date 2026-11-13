import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { PlaygroundEntry } from '../config';

const MAX_RESULTS = 8;

/**
 * Header search (WAI-ARIA combobox with a listbox): finds any page by title, selector, group or
 * description. "/" or Ctrl+K focuses it from anywhere; arrows move, Enter opens, Escape clears.
 */
@Component({
  selector: 'dahc-playground-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './docs.scss',
  host: {
    class: 'pg-search',
    '(document:keydown)': 'onDocumentKey($event)',
    // Option clicks are handled here: options are not focusable (aria-activedescendant pattern).
    '(click)': 'onOptionClick($event)',
    '(pointerdown)': 'onOptionPointerDown($event)',
  },
  template: `
    <label class="dahc-visually-hidden" for="pg-search-input">Search components and docs</label>
    <span class="pg-search-icon" aria-hidden="true"></span>
    <input
      #field
      id="pg-search-input"
      class="pg-search-input"
      type="search"
      role="combobox"
      autocomplete="off"
      placeholder="Search in DAHC UI"
      aria-autocomplete="list"
      aria-controls="pg-search-results"
      [attr.aria-expanded]="open()"
      [attr.aria-activedescendant]="open() && active() >= 0 ? 'pg-search-option-' + active() : null"
      aria-describedby="pg-search-hint"
      [value]="query()"
      (input)="onInput($event)"
      (keydown)="onKey($event)"
      (focus)="opened.set(true)"
      (blur)="close()" />
    <kbd class="pg-search-kbd" aria-hidden="true">/</kbd>
    <span id="pg-search-hint" class="dahc-visually-hidden">Press slash or Control K to search from anywhere.</span>
    <ul id="pg-search-results" class="pg-search-results" role="listbox" aria-label="Search results" [hidden]="!open()">
      @for (entry of results(); track entry.path; let index = $index) {
        <li
          role="option"
          class="pg-search-option"
          [id]="'pg-search-option-' + index"
          [attr.aria-selected]="index === active()"
          [attr.data-path]="entry.path">
          <span class="pg-search-option-title">{{ entry.title }}</span>
          <span class="pg-search-option-meta">{{ entry.selector || entry.group }}</span>
          @if (entry.description) {
            <span class="pg-search-option-description">{{ entry.description }}</span>
          }
        </li>
      } @empty {
        <li class="pg-search-empty" role="option" aria-disabled="true" aria-selected="false">No pages match "{{ query() }}"</li>
      }
    </ul>
  `,
})
export class PlaygroundSearchComponent {
  private readonly router = inject(Router);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  readonly entries = input.required<readonly PlaygroundEntry[]>();

  protected readonly query = signal<string>('');
  protected readonly opened = signal<boolean>(false);
  protected readonly active = signal<number>(-1);

  protected readonly results = computed<readonly PlaygroundEntry[]>(() => {
    const words = this.query().toLowerCase().split(/\s+/).filter(word => word !== '');

    return this.entries()
      .filter(entry => {
        const text = `${entry.title} ${entry.selector ?? ''} ${entry.group} ${entry.description ?? ''}`.toLowerCase();

        return words.every(word => text.includes(word));
      })
      .sort((first, second) => rank(second, words) - rank(first, words))
      .slice(0, MAX_RESULTS);
  });

  protected readonly open = computed<boolean>(() => this.opened() && this.query().trim() !== '');

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.opened.set(true);
    this.active.set(this.results().length > 0 ? 0 : -1);
  }

  protected onKey(event: KeyboardEvent): void {
    const count = this.results().length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.opened.set(true);
        this.active.set(count === 0 ? -1 : (this.active() + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.active.set(count === 0 ? -1 : (this.active() - 1 + count) % count);
        break;
      case 'Enter': {
        const entry = this.results()[this.active()];

        if (entry) {
          event.preventDefault();
          this.go(entry);
        }

        break;
      }
      case 'Escape':
        if (this.query() !== '') {
          event.preventDefault();
          this.query.set('');
        }

        this.opened.set(false);
        break;
    }
  }

  protected onDocumentKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = target?.closest('input, textarea, select, [contenteditable="true"]') !== null;
    const shortcut = (event.key === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !typing);

    if (shortcut) {
      event.preventDefault();
      this.field().nativeElement.focus();
    }
  }

  protected onOptionClick(event: MouseEvent): void {
    const option = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-path]');
    const entry = this.results().find(item => item.path === option?.dataset['path']);

    if (entry) {
      this.go(entry);
    }
  }

  /** Keeps focus in the field while an option is pressed, so the list does not close first. */
  protected onOptionPointerDown(event: PointerEvent): void {
    if ((event.target as HTMLElement | null)?.closest('[role="option"]')) {
      event.preventDefault();
    }
  }

  protected go(entry: PlaygroundEntry): void {
    this.query.set('');
    this.opened.set(false);
    void this.router.navigateByUrl(`/${entry.path}`);
  }

  protected close(): void {
    this.opened.set(false);
  }
}

function rank(entry: PlaygroundEntry, words: readonly string[]): number {
  const title = entry.title.toLowerCase();

  return words.reduce((score, word) => score + (title.startsWith(word) ? 3 : title.includes(word) ? 2 : 0), 0);
}
