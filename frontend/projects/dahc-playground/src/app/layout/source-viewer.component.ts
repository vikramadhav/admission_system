import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DahcLiveAnnouncer } from 'dahc-ui';
import { forkJoin } from 'rxjs';

interface SourceFile {
  readonly name: string;
  readonly content: string;
}

/**
 * Shows a component's real source files. The build copies projects/dahc-ui/src/lib into the
 * playground output as assets (angular.json), so the text is never maintained by hand.
 */
@Component({
  selector: 'dahc-source-viewer',
  templateUrl: './source-viewer.component.html',
  styleUrl: './source-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceViewerComponent {
  readonly files = input.required<readonly string[]>();

  private readonly http = inject(HttpClient);
  private readonly announcer = inject(DahcLiveAnnouncer);

  protected readonly selectedIndex = signal<number>(0);
  protected readonly sources = rxResource({
    params: () => this.files(),
    stream: ({ params }) =>
      forkJoin(params.map(file => this.http.get(`source/lib/${file}`, { responseType: 'text' }))),
  });

  protected readonly loadedFiles = computed<readonly SourceFile[]>(() => {
    const contents = this.sources.hasValue() ? this.sources.value() : [];

    return contents.map((content, index) => ({ name: this.files()[index] ?? '', content }));
  });

  protected readonly selectedFile = computed<SourceFile | null>(
    () => this.loadedFiles()[this.selectedIndex()] ?? null,
  );

  protected select(index: number): void {
    this.selectedIndex.set(index);
  }

  protected async copy(file: SourceFile): Promise<void> {
    try {
      await navigator.clipboard.writeText(file.content);
      this.announcer.announce(`Copied ${file.name}`);
    } catch {
      this.announcer.announce(`Could not copy ${file.name}. Select the text and copy it instead.`, 'assertive');
    }
  }
}
