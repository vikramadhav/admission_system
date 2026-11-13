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

/** Mock persistence. Only fake data is stored, and only in the mock build (sessionStorage, per tab). */
const STORAGE_KEY = 'gme-mock-db-v1';
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

export interface MockDatabase {
  candidates: Record<string, MockCandidate>;
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
