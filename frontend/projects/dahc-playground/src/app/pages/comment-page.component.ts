import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DahcButtonComponent, DahcCommentComponent } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-comment-page',
  templateUrl: './comment-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcButtonComponent, DahcCommentComponent, PlaygroundPageComponent],
})
export class CommentPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show a discussion about an item, such as reviewer remarks on an application.',
    'Nest replies under the comment they answer and keep threads shallow.',
    'Give datetimeValue (ISO) with the readable time so assistive technology gets an exact date.',
  ];

  protected readonly sourceFiles = [
    'data-display/comment/comment.component.ts',
    'data-display/comment/comment.component.css',
  ];
}
