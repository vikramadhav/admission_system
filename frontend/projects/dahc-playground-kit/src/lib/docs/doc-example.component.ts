import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DahcLiveAnnouncer } from 'dahc-ui';
import { of } from 'rxjs';

import { injectPlaygroundConfig } from '../config';

/**
 * One example card (NG-ZORRO style): the live demo, its title and description, and the code
 * that produced it. The code is read from the page's own template, which the playground build
 * copies as an asset (pageSourceBaseUrl), so it never goes out of date:
 *
 *   <dahc-doc-example examples exampleId="sizes" heading="Sizes" template="button-page.component.html">
 *     …demo…
 *   </dahc-doc-example>
 */
@Component({
  selector: 'dahc-doc-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './docs.scss',
  host: { class: 'pg-example-host' },
  template: `
    <section class="pg-example" [id]="anchorId()" [attr.aria-labelledby]="anchorId() + '-title'">
      <div class="pg-example-demo"><ng-content /></div>
      <div class="pg-example-meta">
        <h3 class="pg-example-title" [id]="anchorId() + '-title'">{{ heading() }}</h3>
        @if (description()) {
          <p class="pg-example-description">{{ description() }}</p>
        }
        @if (template()) {
          <div class="pg-example-actions">
            <button
              type="button"
              class="pg-example-action"
              [attr.aria-expanded]="codeOpen()"
              [attr.aria-controls]="anchorId() + '-code'"
              (click)="codeOpen.set(!codeOpen())">
              {{ codeOpen() ? 'Hide code' : 'Show code' }}
            </button>
            <button type="button" class="pg-example-action" [disabled]="code() === ''" (click)="copy()">Copy code</button>
          </div>
        }
      </div>
      @if (template()) {
        <div class="pg-example-code" [id]="anchorId() + '-code'" [hidden]="!codeOpen()">
          <pre tabindex="0" [attr.aria-label]="heading() + ' code'"><code>{{ code() || 'Loading…' }}</code></pre>
        </div>
      }
    </section>
  `,
})
export class DocExampleComponent {
  private readonly http = inject(HttpClient);
  private readonly announcer = inject(DahcLiveAnnouncer);
  private readonly pageSourceBaseUrl = injectPlaygroundConfig().pageSourceBaseUrl;

  readonly heading = input.required<string>();
  readonly description = input<string>('');
  /** Unique within the page; also the anchor in the page contents. */
  readonly exampleId = input.required<string>();
  /** The page template that contains this example, relative to pageSourceBaseUrl. Without it no code is shown. */
  readonly template = input<string>('');

  protected readonly codeOpen = signal<boolean>(false);
  readonly anchorId = computed<string>(() => `example-${this.exampleId()}`);

  // Page templates are small and cached by the browser, so the code loads with the card and
  // "Copy code" works before the code is shown.
  private readonly source = rxResource({
    params: () => this.template(),
    stream: ({ params }) =>
      params === '' ? of('') : this.http.get(`${this.pageSourceBaseUrl}${params}`, { responseType: 'text' }),
  });

  protected readonly code = computed<string>(() => {
    const page = this.source.hasValue() ? this.source.value() : '';

    return page === '' ? '' : extractExample(page, this.exampleId());
  });

  protected async copy(): Promise<void> {
    const code = this.code();

    if (code === '') {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      this.announcer.announce(`Copied the ${this.heading()} code`);
    } catch {
      this.announcer.announce('Could not copy. Select the code and copy it instead.', 'assertive');
    }
  }
}

/** The inner markup of <dahc-doc-example exampleId="id"> in a page template, dedented. */
export function extractExample(page: string, id: string): string {
  const open = new RegExp(`<dahc-doc-example\\b[^>]*\\bexampleId="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`);
  const match = open.exec(page);

  if (!match) {
    return '';
  }

  const start = match.index + match[0].length;
  const end = page.indexOf('</dahc-doc-example>', start);
  const body = page.slice(start, end === -1 ? undefined : end).replace(/^\s*\n/, '').replace(/\s+$/, '');
  const lines = body.split('\n');
  const indent = Math.min(...lines.filter(line => line.trim() !== '').map(line => line.length - line.trimStart().length));

  return lines.map(line => line.slice(Number.isFinite(indent) ? indent : 0)).join('\n');
}
