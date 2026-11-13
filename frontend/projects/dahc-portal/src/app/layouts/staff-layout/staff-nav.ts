import { DahcPermission } from '../../core/permissions/permissions';

export interface StaffNavItem {
  readonly label: string;
  readonly route: string;
  /** Shown only when the active role has this permission. */
  readonly permission: DahcPermission;
}

/**
 * Header navigation for every staff area. Each user sees only the items their active role may
 * open, so a single-role user gets a short menu of their own screens.
 */
export function staffNavItems(): readonly StaffNavItem[] {
  return [
    { label: $localize`:@@portal.nav.officerDashboard:My applications`, route: '/admission/officer', permission: 'admission.officer.dashboard' },
    { label: $localize`:@@portal.nav.supervisorDashboard:Supervision`, route: '/admission/supervisor', permission: 'admission.supervisor.dashboard' },
    { label: $localize`:@@portal.nav.screening:Screening`, route: '/admission/screening', permission: 'admission.screening.read' },
    { label: $localize`:@@portal.nav.siteMonitoring:Site monitoring`, route: '/monitoring', permission: 'monitoring.dashboard.read' },
    { label: $localize`:@@portal.nav.refereeDashboard:My portfolios`, route: '/scoring/referee', permission: 'scoring.referee.dashboard' },
    { label: $localize`:@@portal.nav.seniorDashboard:Scoring oversight`, route: '/scoring/senior', permission: 'scoring.senior.dashboard' },
    { label: $localize`:@@portal.nav.payments:Payments`, route: '/finance/payments', permission: 'finance.payments.read' },
    { label: $localize`:@@portal.nav.staffUsers:Staff users`, route: '/admin/staff-users', permission: 'admin.staffUsers.manage' },
    {
      label: $localize`:@@portal.nav.integrationClients:Integration clients`,
      route: '/admin/integration-clients',
      permission: 'admin.integrationClients.manage',
    },
  ];
}
