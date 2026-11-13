import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';

export type DahcAvatarSize = 'sm' | 'md' | 'lg';

/** Initials from a name: first letters of the first and last words (Arabic-safe). */
export function dahcInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  const first = [...(words[0] ?? '')][0] ?? '';
  const last = words.length > 1 ? ([...(words[words.length - 1] ?? '')][0] ?? '') : '';

  return (first + last).toUpperCase();
}

/**
 * A person shown by photo or, without one (or when it fails to load), by initials on a navy
 * circle. The avatar is an image named after the person. Sizes sm 32, md 40, lg 48 px.
 * DERIVED (DH has no avatar; MBRU header and comment initials).
 * Ported from dubai-health-ui dh-avatar.
 */
@Component({
  selector: 'dahc-avatar',
  styleUrl: './avatar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-avatar dahc-avatar--' + size()",
    role: 'img',
    '[attr.aria-label]': 'accessibleName()',
  },
  template: `
    @if (showImage()) {
      <img class="dahc-avatar__image" [src]="src()" alt="" (error)="failed.set(true)" />
    } @else {
      <span class="dahc-avatar__initials" aria-hidden="true">{{ initials() }}</span>
    }
  `,
})
export class DahcAvatarComponent {
  /** The person's name: the accessible name and the source of the initials. */
  readonly name = input<string>('');
  /** Photo URL; initials are shown when it is empty or fails to load. */
  readonly src = input<string>('');
  readonly size = input<DahcAvatarSize>('md');
  /** Name read when no name is given. */
  readonly fallbackLabel = input<string>($localize`:@@dahcUi.avatar.label:Avatar`);

  protected readonly failed = signal<boolean>(false);
  protected readonly showImage = computed<boolean>(() => this.src() !== '' && !this.failed());
  protected readonly initials = computed<string>(() => dahcInitials(this.name()));
  protected readonly accessibleName = computed<string>(() => this.name() || this.fallbackLabel());

  constructor() {
    // A new photo gets a new chance to load.
    effect(() => {
      this.src();
      this.failed.set(false);
    });
  }
}
