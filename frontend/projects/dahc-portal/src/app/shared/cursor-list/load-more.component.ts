import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DahcButtonComponent } from 'dahc-ui';

/**
 * "Load more" for cursor-paged lists (GAP-02: DAHC-UI pagination needs a total, the contract has
 * none). It states how many rows are shown, politely announced, and loads the next page.
 */
@Component({
  selector: 'dahc-load-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcButtonComponent],
  styles: `
    :host { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--dahc-space-3); }
    .count { margin: 0; color: var(--dahc-color-text-secondary); font-size: var(--dahc-type-body-sm-size); line-height: var(--dahc-type-body-sm-line-height); }
  `,
  template: `
    <p class="count" aria-live="polite" i18n="@@portal.list.shown">Showing {{ shown() }} {shown(), plural, =1 {item} other {items}}</p>
    @if (hasMore()) {
      <button dahc-button type="button" variant="secondary" size="sm" [disabled]="loading()" (click)="loadMore.emit()" i18n="@@portal.list.loadMore">Load more</button>
    }
  `,
})
export class LoadMoreComponent {
  readonly shown = input.required<number>();
  readonly hasMore = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly loadMore = output<void>();
}
