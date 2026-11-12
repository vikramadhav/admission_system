// Hand-written from the contract schemas ApplicationSummary, Application, PreferenceInput,
// TrainingSitePreferenceInput, CreateApplicationRequest, UpdateDraftRequest and
// AnnouncedScores (OQ-08).

import { Program } from './catalog.models';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'CORRECTION_SUBMITTED'
  | 'SCREENED_OUT'
  | 'REVIEW_COMPLETED'
  | 'APPEAL_UNDER_REVIEW'
  | 'WITHDRAWN'
  | 'ARCHIVED';

export interface TrainingSitePreference {
  readonly siteId: string;
  readonly siteOrder: number;
}

export interface Preference {
  readonly specialtyId: string;
  readonly preferenceOrder: number;
  readonly trainingSites: readonly TrainingSitePreference[];
}

export interface AnnouncedScores {
  readonly announcedAt: string;
  readonly finalPortfolioScore: number;
  readonly shortlistingScore: number;
  readonly gpaShortlistingScore?: number | null;
  readonly examShortlistingScore?: number | null;
  readonly casperScore?: number | null;
  readonly appealDeadline?: string | null;
  readonly reannouncedAt?: string | null;
}

export interface ApplicationSummary {
  readonly id: string;
  /** "Application ID" shown to people: cycle start year plus a 7-digit counter (D-19). */
  readonly applicationNumber: string;
  readonly program: Program;
  readonly status: ApplicationStatus;
  readonly createdAt: string;
  readonly submittedAt?: string | null;
  readonly version: number;
  readonly preferences?: readonly Preference[];
  readonly announcedScores?: AnnouncedScores | null;
}

/** Sections (OQ-02) are not part of D1, so they are not modelled here. */
export type Application = ApplicationSummary;

export interface CreateApplicationRequest {
  readonly programId: string;
  readonly preferences: readonly Preference[];
}

/** JSON Merge Patch document; D1 saves preferences only. */
export interface UpdateDraftRequest {
  readonly preferences: readonly Preference[];
}
