// Hand-written from the contract schemas Program, Specialty and TrainingSite (OQ-08).

export type ProgramCategory = 'CERTIFICATE' | 'INTERNSHIP' | 'RESIDENCY' | 'FELLOWSHIP';

export interface Program {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly category: ProgramCategory;
  readonly cycleId?: string;
  readonly applicationOpensAt?: string | null;
  readonly applicationClosesAt?: string | null;
  readonly timeZoneId?: string;
}

export interface Specialty {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface TrainingSite {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}
