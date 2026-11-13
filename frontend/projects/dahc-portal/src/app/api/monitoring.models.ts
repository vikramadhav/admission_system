// Hand-written from the contract schemas SiteMonitoringDashboard and MonitoringApplicationRow (OQ-08).

import { PortfolioStatus, VerificationPoolInsights, VerificationStatus } from './admission.models';
import { ApplicationStatus } from './application.models';

// Central monitoring (US-2.1.4).

export interface SiteMonitoringDashboard {
  readonly poolInsights: VerificationPoolInsights;
  readonly siteInterestBySpecialty: readonly {
    readonly siteId: string;
    readonly siteName: string;
    readonly specialtyId: string;
    readonly specialtyName: string;
    readonly selectionCount: number;
  }[];
  readonly siteApplicationsByStatus: readonly {
    readonly applicationStatus: ApplicationStatus;
    readonly siteId: string;
    readonly siteName: string;
    readonly applicationCount: number;
  }[];
  readonly siteApplicationsByProgram: readonly {
    readonly programId: string;
    readonly programName: string;
    readonly siteId: string;
    readonly siteName: string;
    readonly applicationCount: number;
  }[];
  readonly generatedAt: string;
}

export interface MonitoringFilters {
  readonly cycleId?: string | null;
  readonly programId?: string | null;
  readonly siteId?: string | null;
}

/** Drill-down filters: the chart segment that was chosen. */
export interface MonitoringDrillDown extends MonitoringFilters {
  readonly specialtyId?: string | null;
  readonly applicationStatus?: ApplicationStatus | null;
}

export interface MonitoringApplicationRow {
  readonly applicationId: string;
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly cycleId: string;
  readonly cycleName?: string;
  readonly programName: string;
  readonly applicationStatus: ApplicationStatus;
  readonly verificationStatus?: VerificationStatus | null;
  readonly portfolioStatus?: PortfolioStatus | null;
  readonly submittedAt?: string | null;
}

export type MonitoringSort = 'submittedAt' | 'applicationId' | 'candidateName' | 'applicationStatus';
