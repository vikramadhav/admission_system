import { DahcStatTileColor } from 'dahc-ui';

import { VerificationPoolInsights } from '../../api/admission.models';

/** Shared by the officer and supervisor dashboards and the central monitoring dashboard. */
export interface InsightTile {
  readonly label: string;
  readonly value: string;
  readonly color: DahcStatTileColor;
}

/** Pool insights (US-2.1.2 AC Pool Insights; summed across the caller's pools). */
export function poolTiles(insights: VerificationPoolInsights): readonly InsightTile[] {
  return [
    { label: $localize`:@@portal.admission.officer.poolSubmitted:Submitted`, value: String(insights.submitted), color: 'light-blue' },
    { label: $localize`:@@portal.admission.officer.poolUnderVerification:Under verification`, value: String(insights.underVerification), color: 'blue' },
    { label: $localize`:@@portal.admission.officer.poolWithCandidate:Pending with candidate`, value: String(insights.pendingWithCandidate), color: 'orange' },
    { label: $localize`:@@portal.admission.officer.poolScreenedOut:Screened out`, value: String(insights.screenedOut), color: 'red' },
    { label: $localize`:@@portal.admission.officer.poolCompleted:Completed`, value: String(insights.completed), color: 'green' },
  ];
}

