import { DOCUMENT, Injectable, OnDestroy, inject } from '@angular/core';

export type DahcPoliteness = 'polite' | 'assertive';

/**
 * Announces short messages to screen readers through one visually hidden live region per
 * politeness level, for changes that do not move focus (reordering, background saves).
 */
@Injectable({ providedIn: 'root' })
export class DahcLiveAnnouncer implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly regions = new Map<DahcPoliteness, HTMLElement>();
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  announce(message: string, politeness: DahcPoliteness = 'polite'): void {
    const region = this.getRegion(politeness);
    region.textContent = '';

    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
    }

    // Clearing first and writing after a short delay makes screen readers announce
    // the same message again when it repeats.
    this.pendingTimer = setTimeout(() => {
      region.textContent = message;
      this.pendingTimer = null;
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
    }

    this.regions.forEach(region => region.remove());
    this.regions.clear();
  }

  private getRegion(politeness: DahcPoliteness): HTMLElement {
    const existing = this.regions.get(politeness);

    if (existing) {
      return existing;
    }

    const region = this.document.createElement('div');
    region.className = 'dahc-visually-hidden';
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('data-dahc-live-region', politeness);
    this.document.body.appendChild(region);
    this.regions.set(politeness, region);

    return region;
  }
}
