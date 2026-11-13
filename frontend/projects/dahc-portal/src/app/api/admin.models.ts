// Hand-written from the contract schemas StaffRoleAssignment, StaffUserInput, StaffUser,
// IntegrationClientInput and IntegrationClient (OQ-08).

// Administration (contract Administration tag; PQ-06 resolved).

export interface StaffRoleAssignment {
  readonly roleCode: string;
  readonly programId?: string | null;
  readonly specialtyId?: string | null;
  readonly poolIds?: readonly string[];
  /** Calendar dates. */
  readonly validFrom?: string | null;
  readonly validTo?: string | null;
}

export interface StaffUserInput {
  /** Up to 200 characters. */
  readonly idamUserId: string;
  readonly displayName: string;
  /** Up to 320 characters. */
  readonly email: string;
  readonly linkedCandidateId?: string | null;
  readonly roles: readonly StaffRoleAssignment[];
}

export interface StaffUser {
  readonly staffUserId: string;
  readonly displayName: string;
  readonly email: string;
  readonly isActive: boolean;
  readonly hasSignedIn?: boolean;
  readonly linkedCandidateId?: string | null;
  readonly roles: readonly StaffRoleAssignment[];
  readonly activeRole: string | null;
  /** Sent back as If-Match on role changes; a stale value gets 409. */
  readonly version: string;
}

export type IntegrationPermission = 'payments.events-write';

export interface IntegrationClientInput {
  readonly idamClientId: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly permissions: readonly IntegrationPermission[];
}

export interface IntegrationClient {
  readonly integrationClientId: string;
  readonly idamClientId: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly permissions: readonly string[];
  /** Sent back as If-Match on updates; a stale value gets 409. */
  readonly version: string;
}
