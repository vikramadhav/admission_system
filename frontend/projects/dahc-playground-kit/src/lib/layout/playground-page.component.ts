import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';

import { ApiTableComponent } from '../docs/api-table.component';
import { DocExampleComponent } from '../docs/doc-example.component';
import { SourceViewerComponent } from './source-viewer.component';

interface ContentsItem {
  readonly id: string;
  readonly label: string;
  readonly nested: boolean;
}

/**
 * Documentation page of one component (NG-ZORRO style): title and description, When To Use,
 * Examples (the interactive Playground, every State, then named examples with their code), the API
 * generated from the source, accessibility notes and the source files, with a table of contents.
 *
 * Slots: [preview] and [inspector] (Playground card), [states], [examples] (dahc-doc-example
 * cards), [accessibility].
 */
@Component({
  selector: 'dahc-playground-page',
  templateUrl: './playground-page.component.html',
  styleUrls: ['./playground-page.component.scss', '../docs/docs.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ApiTableComponent, SourceViewerComponent],
})
export class PlaygroundPageComponent {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly heading = input.required<string>();
  readonly description = input.required<string>();
  /** Source files relative to the library sources the app copies into its build (sourceBaseUrl). */
  readonly sourceFiles = input.required<readonly string[]>();
  /** "When To Use" bullet points. */
  readonly whenToUse = input<readonly string[]>([]);
  /** The component's selector, shown next to the title. */
  readonly selector = input<string>('');
  /** TypeScript files for the API section; defaults to the .ts files in sourceFiles. */
  readonly apiFiles = input<readonly string[] | null>(null);
  /** Named examples in one column (default) or two, as on NG-ZORRO. */
  readonly exampleColumns = input<1 | 2>(1);

  private readonly examples = contentChildren(DocExampleComponent, { descendants: true });

  protected readonly apiSourceFiles = computed<readonly string[]>(
    () => this.apiFiles() ?? this.sourceFiles().filter(file => file.endsWith('.ts')),
  );

  protected readonly activeSection = signal<string>('');

  protected readonly contents = computed<readonly ContentsItem[]>(() => [
    ...(this.whenToUse().length > 0 ? [{ id: 'pg-when-to-use', label: 'When To Use', nested: false }] : []),
    { id: 'pg-examples', label: 'Examples', nested: false },
    { id: 'example-playground', label: 'Playground', nested: true },
    { id: 'example-states', label: 'States', nested: true },
    ...this.examples().map(example => ({ id: example.anchorId(), label: example.heading(), nested: true })),
    { id: 'pg-api', label: 'API', nested: false },
    { id: 'pg-accessibility', label: 'Accessibility', nested: false },
    { id: 'pg-source', label: 'Source', nested: false },
  ]);

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Scroll spy: the last section whose top has passed the upper third of the viewport is current.
    afterNextRender(() => {
      const view = this.document.defaultView;

      if (!view) {
        return;
      }

      const update = (): void => {
        const limit = view.innerHeight / 3;
        let current = '';

        for (const item of this.contents()) {
          const element = this.host.nativeElement.querySelector<HTMLElement>(`[id="${item.id}"]`);

          if (element && element.getBoundingClientRect().top <= limit) {
            current = item.id;
          }
        }

        this.activeSection.set(current);
      };

      view.addEventListener('scroll', update, { passive: true });
      update();
      destroyRef.onDestroy(() => view.removeEventListener('scroll', update));
    });
  }

  protected goTo(event: Event, id: string): void {
    event.preventDefault();
    const target = this.host.nativeElement.querySelector<HTMLElement>(`[id="${id}"]`);

    if (!target) {
      return;
    }

    const reduce = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    const heading = target.matches('h2, h3') ? target : target.querySelector<HTMLElement>('h2, h3');

    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }

    this.activeSection.set(id);
  }
}
