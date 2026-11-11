import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SourceViewerComponent } from './source-viewer.component';

/**
 * Layout shared by every component page: live preview, property inspector, every state,
 * accessibility notes and the component's real source files.
 */
@Component({
  selector: 'dahc-playground-page',
  templateUrl: './playground-page.component.html',
  styleUrl: './playground-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SourceViewerComponent],
})
export class PlaygroundPageComponent {
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
  /** Source files relative to projects/dahc-ui/src/lib, copied into the build as assets. */
  readonly sourceFiles = input.required<readonly string[]>();
}
