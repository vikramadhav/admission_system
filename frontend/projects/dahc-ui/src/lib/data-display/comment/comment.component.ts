import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DahcAvatarComponent } from '../avatar/avatar.component';

/**
 * A comment with its author, role and time, for review threads: an article named "Comment by
 * <author>". Content is projected; [dahcCommentActions] holds reply / edit actions and
 * [dahcCommentReplies] nested comments. DERIVED (MBRU reviewer comment history).
 * Ported from dubai-health-ui dh-comment.
 */
@Component({
  selector: 'dahc-comment',
  styleUrl: './comment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAvatarComponent],
  host: { class: 'dahc-comment' },
  template: `
    <article class="dahc-comment__article" [attr.aria-label]="articleLabel()">
      <dahc-avatar [name]="author()" [src]="avatarSrc()" size="sm" aria-hidden="true" />
      <div class="dahc-comment__main">
        <p class="dahc-comment__head">
          <span class="dahc-comment__author">{{ author() }}</span>
          @if (authorRole() !== '') {
            <span class="dahc-comment__meta">{{ authorRole() }}</span>
          }
          @if (datetime() !== '') {
            <time class="dahc-comment__meta" [attr.datetime]="datetimeValue() || null">{{ datetime() }}</time>
          }
        </p>
        <div class="dahc-comment__body"><ng-content /></div>
        <div class="dahc-comment__actions"><ng-content select="[dahcCommentActions]" /></div>
        <div class="dahc-comment__replies"><ng-content select="[dahcCommentReplies]" /></div>
      </div>
    </article>
  `,
})
export class DahcCommentComponent {
  readonly author = input.required<string>();
  /** Author role, for example "Admission Officer". */
  readonly authorRole = input<string>('');
  /** Time as shown, for example "12 Mar 2026, 10:24". */
  readonly datetime = input<string>('');
  /** Machine-readable time for the time element (ISO 8601). */
  readonly datetimeValue = input<string>('');
  readonly avatarSrc = input<string>('');
  readonly commentByLabel = input<string>($localize`:@@dahcUi.comment.by:Comment by`);

  protected readonly articleLabel = computed<string>(() => `${this.commentByLabel()} ${this.author()}`);
}
