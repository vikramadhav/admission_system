// Hand-written from the contract schemas AuthSession and UserPreferences (OQ-08).

import { DahcCulture } from '../core/config/portal-config';

export type UserType = 'CANDIDATE' | 'STAFF';

export interface UserPreferences {
  /** IANA time zone id. */
  readonly timeZoneId: string;
  readonly culture: DahcCulture;
}

/** The signed-in user as known to DAHC, returned by sign-in and me. */
export interface AuthSession {
  readonly userType: UserType;
  readonly userId: string;
  /** Nine-digit text with leading zeros (D-05, D-13); candidates only. */
  readonly candidateNumber?: string | null;
  readonly displayName: string;
  readonly email?: string | null;
  readonly roles: readonly string[];
  readonly activeRole: string;
  readonly preferences: UserPreferences;
}
