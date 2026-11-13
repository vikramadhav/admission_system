import { RoleCode } from '../auth/roles';

/**
 * Client-side permissions, derived from the active role only. They copy the contract's
 * x-dahc-roles per operation and decide what the portal shows. They are a usability aid, never
 * security: the API authorizes every request with the server-stored active role.
 */
export type DahcPermission =
  | 'candidate.portal'
  // Admission officer (EPIC-02)
  | 'admission.officer.dashboard'
  | 'admission.pool.retrieve'
  | 'admission.application.flag'
  | 'admission.application.returnForCorrection'
  | 'admission.application.completeVerification'
  | 'admission.application.replaceAttachment'
  | 'admission.application.recommendScreenOut'
  | 'admission.application.escalate'
  | 'admission.application.continueAfterFeedback'
  // Shared read of an application under review
  | 'admission.application.read'
  | 'admission.attachment.download'
  // Admission supervisor (EPIC-02)
  | 'admission.supervisor.dashboard'
  | 'admission.workload.read'
  | 'admission.application.reassign'
  | 'admission.screenOut.decide'
  | 'admission.clarification.respond'
  | 'admission.reinstatement.read'
  | 'admission.reinstatement.decide'
  | 'admission.application.reinstate'
  | 'admission.icp.refresh'
  | 'admission.duplicates.read'
  // Screening and announcements (EPIC-04)
  | 'admission.screening.read'
  | 'admission.screening.casperImport'
  | 'admission.screening.announce'
  | 'admission.screening.bulkScreenOut'
  | 'admission.screening.reannounce'
  // Portfolio scoring (EPIC-03)
  | 'scoring.referee.dashboard'
  | 'scoring.pool.retrieve'
  | 'scoring.portfolio.read'
  | 'scoring.portfolio.score'
  | 'scoring.portfolio.declareConflict'
  | 'scoring.senior.dashboard'
  | 'scoring.portfolio.reassign'
  | 'scoring.portfolio.override'
  | 'scoring.portfolio.readAll'
  | 'scoring.evidence.replace'
  // Finance (US-1.3.13)
  | 'finance.payments.read'
  | 'finance.payments.export'
  // Central monitoring (US-2.1.4)
  | 'monitoring.dashboard.read'
  | 'monitoring.applications.read'
  // Administration (contract Administration tag)
  | 'admin.staffUsers.manage'
  | 'admin.integrationClients.manage';

const OFFICER: readonly DahcPermission[] = [
  'admission.officer.dashboard',
  'admission.pool.retrieve',
  'admission.application.flag',
  'admission.application.returnForCorrection',
  'admission.application.completeVerification',
  'admission.application.replaceAttachment',
  'admission.application.recommendScreenOut',
  'admission.application.escalate',
  'admission.application.continueAfterFeedback',
  'admission.application.read',
  'admission.attachment.download',
];

const SUPERVISOR: readonly DahcPermission[] = [
  'admission.application.read',
  'admission.attachment.download',
  'admission.supervisor.dashboard',
  'admission.workload.read',
  'admission.application.reassign',
  'admission.screenOut.decide',
  'admission.clarification.respond',
  'admission.reinstatement.read',
  'admission.reinstatement.decide',
  'admission.application.reinstate',
  'admission.icp.refresh',
  'admission.duplicates.read',
  'admission.screening.read',
  'admission.screening.casperImport',
  'admission.screening.announce',
  'admission.screening.bulkScreenOut',
  'admission.screening.reannounce',
  'monitoring.dashboard.read',
  'monitoring.applications.read',
];

const REFEREE: readonly DahcPermission[] = [
  'scoring.referee.dashboard',
  'scoring.pool.retrieve',
  'scoring.portfolio.read',
  'scoring.portfolio.score',
  'scoring.portfolio.declareConflict',
];

export const ROLE_PERMISSIONS: Readonly<Record<RoleCode, readonly DahcPermission[]>> = {
  CANDIDATE: ['candidate.portal'],
  ADMISSION_OFFICER: OFFICER,
  ADMISSION_SUPERVISOR: SUPERVISOR,
  REFEREE,
  THIRD_REFEREE: REFEREE,
  SECOND_EVALUATION_REFEREE: REFEREE,
  // replacePortfolioEvidence also allows the supervisor, but the supervisor has no entry point yet (PQ-08).
  SENIOR_REFEREE: [
    'scoring.senior.dashboard',
    'scoring.portfolio.reassign',
    'scoring.portfolio.override',
    'scoring.portfolio.readAll',
    'scoring.evidence.replace',
  ],
  FINANCE_OFFICER: ['finance.payments.read', 'finance.payments.export'],
  CENTRAL_MONITOR: ['monitoring.dashboard.read', 'monitoring.applications.read', 'admission.application.read', 'admission.attachment.download'],
  ADMINISTRATOR: ['admin.staffUsers.manage', 'admin.integrationClients.manage'],
};
