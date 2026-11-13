import { Program, Specialty, TrainingSite } from '../api/catalog.models';

/** Mock admission cycle 2026-2027 with programs, specialties and training sites (BRD appendix). */
export const MOCK_CYCLE = {
  id: '6f1c0000-0000-4000-8000-000000002026',
  label: '2026-2027',
  academicYear: '2026',
  creationDeadline: '2026-12-31T19:59:59Z',
};

const OPENS = '2026-09-01T04:00:00Z';
const CLOSES = '2026-12-31T19:59:59Z';

function program(id: string, code: string, name: string, category: Program['category']): Program {
  return {
    id,
    code,
    name,
    category,
    cycleId: MOCK_CYCLE.id,
    applicationOpensAt: OPENS,
    applicationClosesAt: CLOSES,
    timeZoneId: 'Asia/Dubai',
  };
}

export const MOCK_PROGRAMS: readonly Program[] = [
  program('p-int-med', 'INT-MED', 'Medical Internship', 'INTERNSHIP'),
  program('p-int-den', 'INT-DEN', 'Dental Internship', 'INTERNSHIP'),
  program('p-cert-mls', 'CERT-MLS', 'Medical Laboratory Certificate', 'CERTIFICATE'),
  program('p-res-med', 'RES-MED', 'Medical Residency', 'RESIDENCY'),
  program('p-res-den', 'RES-DEN', 'Dental Residency', 'RESIDENCY'),
  program('p-res-pha', 'RES-PHA', 'Pharmacy Residency', 'RESIDENCY'),
  program('p-fel', 'FEL', 'Fellowship', 'FELLOWSHIP'),
];

export const MOCK_SITES: readonly TrainingSite[] = [
  { id: 's-rashid', code: 'RH', name: 'Rashid Hospital' },
  { id: 's-latifa', code: 'LH', name: 'Latifa Hospital' },
  { id: 's-dubai', code: 'DH', name: 'Dubai Hospital' },
  { id: 's-hatta', code: 'HH', name: 'Hatta Hospital' },
  { id: 's-jalila', code: 'AJ', name: "Al Jalila Children's Specialty Hospital" },
  { id: 's-dental', code: 'DDH', name: 'Dubai Dental Hospital' },
  { id: 's-phc', code: 'PHC', name: 'Primary Healthcare Centres' },
];

interface MockSpecialty extends Specialty {
  readonly programId: string;
  readonly siteIds: readonly string[];
}

function specialty(id: string, name: string, programId: string, siteIds: readonly string[]): MockSpecialty {
  return { id, code: id.toUpperCase(), name, programId, siteIds };
}

const GENERAL = ['s-rashid', 's-latifa', 's-dubai'];

export const MOCK_SPECIALTIES: readonly MockSpecialty[] = [
  specialty('sp-int-med', 'Medical Internship', 'p-int-med', [...GENERAL, 's-hatta']),
  specialty('sp-int-den', 'Dental Internship', 'p-int-den', ['s-dental']),
  specialty('sp-mls', 'Medical Laboratory', 'p-cert-mls', ['s-rashid', 's-dubai']),
  specialty('sp-im', 'Internal Medicine', 'p-res-med', GENERAL),
  specialty('sp-fm', 'Family Medicine', 'p-res-med', ['s-dubai', 's-latifa', 's-phc']),
  specialty('sp-em', 'Emergency Medicine', 'p-res-med', ['s-rashid', 's-dubai']),
  specialty('sp-ped', 'Pediatrics', 'p-res-med', ['s-latifa', 's-jalila']),
  specialty('sp-gs', 'General Surgery', 'p-res-med', ['s-rashid', 's-dubai']),
  specialty('sp-psy', 'Psychiatry', 'p-res-med', ['s-rashid']),
  specialty('sp-ortho', 'Orthodontics', 'p-res-den', ['s-dental']),
  specialty('sp-endo', 'Endodontics', 'p-res-den', ['s-dental']),
  specialty('sp-prostho', 'Prosthodontics', 'p-res-den', ['s-dental', 's-dubai']),
  specialty('sp-cp', 'Clinical Pharmacy', 'p-res-pha', GENERAL),
  specialty('sp-card', 'Adult Cardiology', 'p-fel', ['s-rashid', 's-dubai']),
  specialty('sp-endocrine', 'Adult Endocrine', 'p-fel', ['s-dubai']),
  specialty('sp-neo', 'Neonatology', 'p-fel', ['s-latifa']),
  specialty('sp-pem', 'Pediatric Emergency Medicine', 'p-fel', ['s-latifa', 's-jalila']),
  specialty('sp-ccm', 'Critical Care Medicine', 'p-fel', ['s-rashid', 's-dubai']),
];

export function mockProgram(id: string): Program | undefined {
  return MOCK_PROGRAMS.find(item => item.id === id);
}

export function mockSpecialty(id: string): MockSpecialty | undefined {
  return MOCK_SPECIALTIES.find(item => item.id === id);
}

export function mockSite(id: string): TrainingSite | undefined {
  return MOCK_SITES.find(item => item.id === id);
}

export function toSpecialty({ id, code, name }: MockSpecialty): Specialty {
  return { id, code, name };
}
