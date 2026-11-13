import { DOCUMENT, DestroyRef, Injectable, NgZone, inject, signal } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { DAHC_PORTAL_CONFIG } from '../config/portal-config';

const WARNING_MS = 2 * 60_000;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

/**
 * Signs the candidate out after the configured inactivity period (Figma: 30 minutes; the API
 * value CandidateDashboard.sessionTimeoutMinutes wins when it arrives) and warns two minutes
 * before. Staying signed in only restarts the browser timer: tokens are not renewed until IDAM
 * confirms its renewal method (OQ-15).
 */
@Injectable({ providedIn: 'root' })
export class InactivityService {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly auth = inject(AuthService);
  private timeoutMs = inject(DAHC_PORTAL_CONFIG).sessionTimeoutMinutes * 60_000;
  private lastActivity = Date.now();
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly warningState = signal<boolean>(false);
  private readonly secondsLeftState = signal<number>(0);

  /** True while the "you will be signed out" warning should show. */
  readonly warning = this.warningState.asReadonly();
  readonly secondsLeft = this.secondsLeftState.asReadonly();

  private readonly onActivity = (): void => {
    if (!this.warningState()) {
      this.lastActivity = Date.now();
    }
  };

  /** Starts watching for the lifetime of the given scope (the candidate layout). */
  start(destroyRef: DestroyRef): void {
    this.lastActivity = Date.now();
    this.zone.runOutsideAngular(() => {
      for (const type of ACTIVITY_EVENTS) {
        this.document.addEventListener(type, this.onActivity, { passive: true });
      }

      this.timer = setInterval(() => this.tick(), 1000);
    });
    destroyRef.onDestroy(() => this.stop());
  }

  setTimeoutMinutes(minutes: number | null | undefined): void {
    if (typeof minutes === 'number' && minutes > 0) {
      this.timeoutMs = minutes * 60_000;
    }
  }

  get timeoutMinutes(): number {
    return Math.round(this.timeoutMs / 60_000);
  }

  staySignedIn(): void {
    this.lastActivity = Date.now();
    this.warningState.set(false);
  }

  private tick(): void {
    const left = this.timeoutMs - (Date.now() - this.lastActivity);

    if (left <= 0) {
      this.stop();
      this.zone.run(() => void this.auth.signOut());

      return;
    }

    const warn = left <= WARNING_MS;

    if (warn || this.warningState()) {
      this.zone.run(() => {
        this.warningState.set(warn);
        this.secondsLeftState.set(Math.ceil(left / 1000));
      });
    }
  }

  private stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }

    for (const type of ACTIVITY_EVENTS) {
      this.document.removeEventListener(type, this.onActivity);
    }
  }
}
