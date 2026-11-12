// Hand-written from the contract schemas CandidateDashboard, CandidateDashboardItem and
// CandidateApplicationAction (OQ-08).

import { ApiPage } from '../core/api/api.models';
import { ApplicationSummary } from './application.models';

export type CandidateApplicationAction =
  | 'VIEW'
  | 'RESUME'
  | 'DISCARD'
  | 'WITHDRAW'
  | 'REINSTATE'
  | 'EDIT_PREFERENCES'
  | 'EXCLUDE_TRAINING_SITE'
  | 'APPEAL';

export type StartNewApplicationDisabledReason = 'ACTIVE_APPLICATION_EXISTS' | 'NO_OPEN_PROGRAM';

export interface StartNewApplicationState {
  readonly enabled: boolean;
  readonly disabledReason?: StartNewApplicationDisabledReason | null;
  readonly nextCycleOpensAt?: string | null;
}

export interface CandidateDashboardItem extends ApplicationSummary {
  readonly submissionDeadline?: string | null;
  readonly announcementDate?: string | null;
  readonly appealDeadline?: string | null;
  /** Evaluated by the API; the portal shows only these actions. */
  readonly allowedActions: readonly CandidateApplicationAction[];
}

export interface CandidateDashboard {
  readonly startNewApplication: StartNewApplicationState;
  readonly sessionTimeoutMinutes?: number;
  readonly items: readonly CandidateDashboardItem[];
  readonly page: ApiPage;
}
