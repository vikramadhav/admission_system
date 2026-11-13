import { DahcTagPurpose } from 'dahc-ui';

import { RefereeRole } from '../../../api/admission.models';
import { PortfolioRoundStatus, ScoringRound } from '../../../api/scoring.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';

/** Labels shared by the senior referee pages (US-3.1.3, US-3.2.2, US-3.2.3). */

export function roundLabel(round: ScoringRound): string {
  switch (round) {
    case 'ROUND_1':
      return $localize`:@@portal.scoring.senior.round1:Round 1`;
    case 'ROUND_2':
      return $localize`:@@portal.scoring.senior.round2:Round 2`;
    case 'ROUND_3':
      return $localize`:@@portal.scoring.senior.round3:Round 3`;
    case 'SECOND_EVALUATION':
      return $localize`:@@portal.scoring.senior.round4:2nd evaluation`;
  }
}

export interface RoundStatusDisplay {
  readonly label: string;
  readonly purpose: DahcTagPurpose;
}

export function roundStatusDisplay(status: PortfolioRoundStatus): RoundStatusDisplay {
  switch (status) {
    case 'PENDING':
      return { label: $localize`:@@portal.scoring.senior.roundPending:Pending`, purpose: 'information' };
    case 'IN_PROGRESS':
      return { label: $localize`:@@portal.scoring.senior.roundInProgress:In progress`, purpose: 'in-progress' };
    case 'COMPLETE':
      return { label: $localize`:@@portal.scoring.senior.roundComplete:Complete`, purpose: 'success' };
    case 'ON_HOLD':
      return { label: $localize`:@@portal.scoring.senior.roundOnHold:On hold`, purpose: 'informative-blue' };
  }
}

export function refereeRoleLabel(role: RefereeRole): string {
  switch (role) {
    case 'REFEREE':
      return $localize`:@@portal.role.referee:Referee`;
    case 'THIRD_REFEREE':
      return $localize`:@@portal.role.thirdReferee:Third referee`;
    case 'SECOND_EVALUATION_REFEREE':
      return $localize`:@@portal.role.secondEvaluationReferee:2nd evaluation referee`;
  }
}

/** "X out of Y" points (BRD US-3.2.2). */
export function pointsOutOf(points: number | null | undefined, total: number | null | undefined): string {
  if (points === null || points === undefined) {
    return '–';
  }

  return total === null || total === undefined
    ? String(points)
    : $localize`:@@portal.scoring.senior.pointsOutOf:${points}:points: out of ${total}:total:`;
}

/** The API's message for a failed action, shown inside a dialog. */
export function problemText(error: unknown): string {
  if (isApiProblemError(error)) {
    return error.problem.detail ?? error.problem.title;
  }

  return $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`;
}

/** Senior referee pages breadcrumb root. */
export function seniorBreadcrumbRoot(): { readonly label: string; readonly route: string } {
  return { label: $localize`:@@portal.nav.seniorDashboard:Scoring oversight`, route: '/scoring/senior' };
}
