// Role codes from the contract (StaffRoleCode plus CANDIDATE) and the portal area each one works in.

export const STAFF_ROLE_CODES = [
  'ADMISSION_OFFICER',
  'ADMISSION_SUPERVISOR',
  'REFEREE',
  'THIRD_REFEREE',
  'SECOND_EVALUATION_REFEREE',
  'SENIOR_REFEREE',
  'FINANCE_OFFICER',
  'CENTRAL_MONITOR',
  'ADMINISTRATOR',
] as const;

export type StaffRoleCode = (typeof STAFF_ROLE_CODES)[number];
export type RoleCode = 'CANDIDATE' | StaffRoleCode;

export type PortalArea = 'candidate' | 'admission' | 'scoring' | 'finance' | 'monitoring' | 'admin';

/**
 * Roles allowed into each lazy area. They follow x-dahc-roles in the contract, for example the
 * site-monitoring operations also allow the admission supervisor (PQ-07).
 */
export const AREA_ROLES: Readonly<Record<PortalArea, readonly RoleCode[]>> = {
  candidate: ['CANDIDATE'],
  admission: ['ADMISSION_OFFICER', 'ADMISSION_SUPERVISOR'],
  scoring: ['REFEREE', 'THIRD_REFEREE', 'SECOND_EVALUATION_REFEREE', 'SENIOR_REFEREE'],
  finance: ['FINANCE_OFFICER'],
  monitoring: ['CENTRAL_MONITOR', 'ADMISSION_SUPERVISOR'],
  admin: ['ADMINISTRATOR'],
};

const ROLE_HOMES: Readonly<Record<RoleCode, string>> = {
  CANDIDATE: '/candidate/dashboard',
  ADMISSION_OFFICER: '/admission/officer',
  ADMISSION_SUPERVISOR: '/admission/supervisor',
  REFEREE: '/scoring/referee',
  THIRD_REFEREE: '/scoring/referee',
  SECOND_EVALUATION_REFEREE: '/scoring/referee',
  SENIOR_REFEREE: '/scoring/senior',
  FINANCE_OFFICER: '/finance/payments',
  CENTRAL_MONITOR: '/monitoring',
  ADMINISTRATOR: '/admin/staff-users',
};

export function isRoleCode(value: string): value is RoleCode {
  return value === 'CANDIDATE' || (STAFF_ROLE_CODES as readonly string[]).includes(value);
}

/** The first page of the given role; an unknown role gets the no-area page. */
export function roleHome(role: string | null | undefined): string {
  return role && isRoleCode(role) ? ROLE_HOMES[role] : '/no-area';
}

/** Display name of a role (BRD role table BRO-01 to BRO-09, contract ADMINISTRATOR). */
export function roleLabel(role: string): string {
  switch (role) {
    case 'CANDIDATE':
      return $localize`:@@portal.role.candidate:Candidate`;
    case 'ADMISSION_OFFICER':
      return $localize`:@@portal.role.admissionOfficer:Admission officer`;
    case 'ADMISSION_SUPERVISOR':
      return $localize`:@@portal.role.admissionSupervisor:Admission supervisor`;
    case 'REFEREE':
      return $localize`:@@portal.role.referee:Referee`;
    case 'THIRD_REFEREE':
      return $localize`:@@portal.role.thirdReferee:Third referee`;
    case 'SECOND_EVALUATION_REFEREE':
      return $localize`:@@portal.role.secondEvaluationReferee:2nd evaluation referee`;
    case 'SENIOR_REFEREE':
      return $localize`:@@portal.role.seniorReferee:Senior referee`;
    case 'FINANCE_OFFICER':
      return $localize`:@@portal.role.financeOfficer:Finance officer`;
    case 'CENTRAL_MONITOR':
      return $localize`:@@portal.role.centralMonitor:Central monitor`;
    case 'ADMINISTRATOR':
      return $localize`:@@portal.role.administrator:Administrator`;
    default:
      return role;
  }
}
