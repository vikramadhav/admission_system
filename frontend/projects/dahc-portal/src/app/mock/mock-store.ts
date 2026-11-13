import { CorrectionFlag } from '../api/admission.models';
import { AnnouncedScores, ApplicationStatus, Preference } from '../api/application.models';
import { UserType } from '../api/auth.models';
import {
  ApplicationSectionKey,
  AttachmentMetadata,
  PaymentSession,
  PortfolioAnswer,
  SectionValues,
} from '../api/candidate-lifecycle.models';
import { PersonalInformationValues } from '../shared/section-values';
import { MockAdmissionState } from './mock-admission-seed';
import { MockOversightState } from './mock-oversight';
import { MockScoringState } from './mock-scoring';

/** Mock persistence. Only fake data is stored, and only in the mock build (sessionStorage, per tab). */
const STORAGE_KEY = 'gme-mock-db-v5';
const USER_KEY = 'gme-mock-user';

export interface MockSection {
  readonly values: SectionValues;
  readonly version: number;
}

export interface MockAppeal {
  readonly submittedAt: string;
  readonly responses: readonly { readonly questionId: string; readonly response: string }[];
}

export interface MockApplication {
  id: string;
  applicationNumber: string;
  programId: string;
  status: ApplicationStatus;
  previousStatus: ApplicationStatus | null;
  createdAt: string;
  submittedAt: string | null;
  version: number;
  preferences: Preference[];
  sections: Partial<Record<ApplicationSectionKey, MockSection>>;
  /** Uploaded files by slot id. */
  attachments: Record<string, AttachmentMetadata>;
  portfolio: { submittedAt: string; answers: PortfolioAnswer[] } | null;
  paymentSessions: PaymentSession[];
  announcedScores: AnnouncedScores | null;
  appeal: MockAppeal | null;
  editPreferencesOpen: boolean;
  reinstatementRequestedAt: string | null;
  excludedSiteIds: string[];
  /** Items an officer returned for correction (US-2.3.4), while the status is Correction Required. */
  correction?: MockCorrection | null;
}

/** Flags with the officer's notes and the end of the correction grace period. */
export interface MockCorrection {
  flags: CorrectionFlag[];
  deadline: string;
}

/** A JSON Pointer of a flag names a section (`/sections/<key>/...`) or an attachment slot (`/attachments/<slotId>`). */
export function flaggedSectionKeys(correction: MockCorrection | null | undefined): string[] {
  const keys = (correction?.flags ?? []).map(flag => flag.fieldPointer.match(/^\/sections\/([^/]+)/)?.[1]).filter((key): key is string => key !== undefined);

  return [...new Set(keys)];
}

export function flaggedSlotIds(correction: MockCorrection | null | undefined): string[] {
  return (correction?.flags ?? [])
    .map(flag => flag.fieldPointer.match(/^\/attachments\/(.+)$/)?.[1])
    .filter((slotId): slotId is string => slotId !== undefined)
    .map(slotId => decodeURIComponent(slotId));
}

export interface MockCandidate {
  userId: string;
  userType: UserType;
  candidateNumber: string | null;
  displayName: string;
  email: string;
  mobile: string;
  /** UAE Pass sign-ins get ICP pre-filled identity fields (SBRD:449). */
  signInMethod: 'UAE_PASS' | 'IDAM';
  profile: PersonalInformationValues;
  profileVersion: number;
  /** Identity field codes filled from ICP, shown read-only. */
  icpFields: string[];
  /** Contact values verified by OTP, by channel. */
  verifiedContacts: string[];
  applications: MockApplication[];
}

/** A pre-registered staff user (D-04: staff and candidates are separate records). */
export interface MockStaffUser {
  userId: string;
  displayName: string;
  email: string;
  roles: string[];
  /** Server-stored active role, shared by every tab (standards s.15). */
  activeRole: string;
}

export interface MockDatabase {
  candidates: Record<string, MockCandidate>;
  staff: Record<string, MockStaffUser>;
  /** Admission back office: pools, officers, applications under review, requests. */
  admission: MockAdmissionState;
  /** Portfolio scoring: referees, portfolios and their rounds. */
  scoring: MockScoringState;
  /** Finance payments, administration users and integration clients. */
  oversight: MockOversightState;
  sequence: number;
}

export function loadDatabase(seed: () => MockDatabase): MockDatabase {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (stored) {
      return JSON.parse(stored) as MockDatabase;
    }
  } catch {
    // Storage unavailable or corrupt: start again from the seed.
  }

  return seed();
}

export function saveDatabase(database: MockDatabase): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  } catch {
    // The mock keeps working in memory.
  }
}

export function clearDatabase(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
}

export function storedUserId(): string | null {
  try {
    return sessionStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

export function storeUserId(userId: string | null): void {
  try {
    if (userId === null) {
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(USER_KEY, userId);
    }
  } catch {
    // Sign-in then lasts until the page reloads.
  }
}
