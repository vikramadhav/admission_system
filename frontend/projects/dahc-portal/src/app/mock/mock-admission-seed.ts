import {
  AnnouncementStatus,
  ApplicationAttachment,
  CorrectionFlag,
  DuplicateAccountPair,
  PortfolioStatus,
  ReinstatementRequestStatus,
  StaffNote,
  VerificationStatus,
} from '../api/admission.models';
import { ApplicationStatus } from '../api/application.models';
import { CasperAttendance } from '../api/screening.models';
import { MOCK_CYCLE } from './mock-catalog';

const DAY = 86_400_000;

function iso(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * DAY).toISOString();
}

export interface MockPool {
  readonly poolId: string;
  readonly programId: string;
  readonly programName: string;
  readonly specialtyName: string;
}

export interface MockOfficer {
  readonly officerId: string;
  readonly name: string;
  readonly poolIds: readonly string[];
}

/** One application in the admission back office (verification, scoring summary, screening). */
export interface MockReviewApplication {
  applicationId: string;
  applicationNumber: string;
  candidateId: string;
  candidateName: string;
  programId: string;
  programName: string;
  specialtyName: string;
  poolId: string;
  submittedAt: string;
  retrievedAt: string | null;
  dueAt: string | null;
  assignedOfficerId: string | null;
  /** Officers whose retrieval went overdue; they cannot retrieve it again (STP-2.2). */
  autoReturnedFrom: string[];
  applicationStatus: ApplicationStatus;
  verificationStatus: VerificationStatus;
  portfolioStatus: PortfolioStatus;
  announcementStatus: AnnouncementStatus;
  /** Statuses before a screen-out, restored by direct reinstatement. */
  previous: { applicationStatus: ApplicationStatus; verificationStatus: VerificationStatus; portfolioStatus: PortfolioStatus } | null;
  gpaShortlistingScore: number | null;
  examShortlistingScore: number | null;
  casperShortlistingScore: number | null;
  casperAttendance: CasperAttendance;
  portfolioScore: number | null;
  weights: { gpa: number; exam: number | null; casper: number; portfolio: number };
  appealed: boolean;
  reviewCompletedAt: string | null;
  initialAnnouncedAt: string | null;
  reannouncedAt: string | null;
  screenOutReasonCode: string | null;
  sections: Record<string, Record<string, unknown>>;
  icpFieldPointers: string[];
  attachments: ApplicationAttachment[];
  flags: CorrectionFlag[];
  notes: StaffNote[];
  screenOutRecommendation: { reasonCode: string; note: string | null } | null;
  /** Requested by the supervisor in the escalation or screen-out queue. */
  requestedAt: string | null;
}

export interface MockReinstatementRequest {
  requestId: string;
  applicationId: string;
  applicationNumber: string;
  candidateName: string;
  programName: string;
  requestedAt: string;
  status: ReinstatementRequestStatus;
  withdrawalReasonCode: string;
  withdrawnAt: string;
  justification: string;
  previousStatus: ApplicationStatus;
  decision: { decision: 'APPROVE' | 'REJECT'; reasonCode: string | null; note: string; decidedAt: string; decidedByDisplayName: string } | null;
}

export interface MockAdmissionState {
  pools: MockPool[];
  officers: MockOfficer[];
  applications: MockReviewApplication[];
  reinstatements: MockReinstatementRequest[];
  duplicates: DuplicateAccountPair[];
  casperUploadVersion: number;
}

export const MOCK_POOLS: readonly MockPool[] = [
  { poolId: 'pool-res-im', programId: 'p-res-med', programName: 'Medical Residency', specialtyName: 'Internal Medicine' },
  { poolId: 'pool-int-med', programId: 'p-int-med', programName: 'Medical Internship', specialtyName: 'Medical Internship' },
  { poolId: 'pool-fel-card', programId: 'p-fel', programName: 'Fellowship', specialtyName: 'Cardiology' },
];

const RESIDENCY_WEIGHTS = { gpa: 30, exam: 30, casper: 20, portfolio: 20 };
const INTERNSHIP_WEIGHTS = { gpa: 50, exam: null, casper: 25, portfolio: 25 };

const FIRST_NAMES = ['Ahmed', 'Sara', 'Hamdan', 'Mariam', 'Yousef', 'Layan', 'Rashed', 'Noor', 'Khalifa', 'Hessa', 'Ali', 'Dana', 'Saeed', 'Reem', 'Majid', 'Alia', 'Faisal', 'Shamma', 'Obaid', 'Latifa', 'Zayed', 'Maitha'];
const LAST_NAMES = ['Al Mazrouei', 'Haddad', 'Al Ketbi', 'Rahman', 'Al Shamsi', 'Nasser', 'Al Suwaidi', 'Farouk', 'Al Nuaimi', 'Saleh', 'Al Dhaheri'];

interface Seed {
  readonly pool: string;
  readonly verification: VerificationStatus;
  readonly application?: ApplicationStatus;
  readonly portfolio?: PortfolioStatus;
  readonly officer?: string | null;
  readonly retrievedDaysAgo?: number;
  readonly announcement?: AnnouncementStatus;
  readonly appealed?: boolean;
  readonly casper?: CasperAttendance;
  readonly screenOutReason?: string;
}

const SEEDS: readonly Seed[] = [
  // Waiting in the pools.
  { pool: 'pool-res-im', verification: 'PENDING', application: 'SUBMITTED', officer: null },
  { pool: 'pool-res-im', verification: 'PENDING', application: 'SUBMITTED', officer: null },
  { pool: 'pool-res-im', verification: 'PENDING', application: 'SUBMITTED', officer: null },
  { pool: 'pool-res-im', verification: 'PENDING', application: 'SUBMITTED', officer: null },
  { pool: 'pool-int-med', verification: 'PENDING', application: 'SUBMITTED', officer: null },
  { pool: 'pool-int-med', verification: 'PENDING', application: 'SUBMITTED', officer: null },
  { pool: 'pool-int-med', verification: 'PENDING', application: 'SUBMITTED', officer: null },
  // The officer's queue (Noura Al Hashimi).
  { pool: 'pool-res-im', verification: 'IN_PROGRESS', officer: 'officer', retrievedDaysAgo: 1 },
  { pool: 'pool-res-im', verification: 'IN_PROGRESS', officer: 'officer', retrievedDaysAgo: 9 },
  { pool: 'pool-int-med', verification: 'CORRECTION_SUBMITTED', officer: 'officer', retrievedDaysAgo: 6 },
  { pool: 'pool-res-im', verification: 'CLARIFICATION_SUBMITTED', officer: 'officer', retrievedDaysAgo: 4 },
  { pool: 'pool-int-med', verification: 'RE_EVALUATING', officer: 'officer', retrievedDaysAgo: 5 },
  { pool: 'pool-res-im', verification: 'CORRECTION_REQUIRED', application: 'CORRECTION_REQUIRED', officer: 'officer', retrievedDaysAgo: 3 },
  { pool: 'pool-int-med', verification: 'PENDING_CLARIFICATION', officer: 'officer', retrievedDaysAgo: 2 },
  { pool: 'pool-res-im', verification: 'SCREEN_OUT_PENDING_APPROVAL', officer: 'officer', retrievedDaysAgo: 2 },
  { pool: 'pool-res-im', verification: 'COMPLETE', portfolio: 'IN_PROGRESS', officer: 'officer', retrievedDaysAgo: 8 },
  // A second officer.
  { pool: 'pool-res-im', verification: 'IN_PROGRESS', officer: 'officer-2', retrievedDaysAgo: 2 },
  { pool: 'pool-res-im', verification: 'IN_PROGRESS', officer: 'officer-2', retrievedDaysAgo: 10 },
  { pool: 'pool-int-med', verification: 'PENDING_CLARIFICATION', officer: 'officer-2', retrievedDaysAgo: 3 },
  // Screening stage: verification and portfolio complete.
  { pool: 'pool-res-im', verification: 'COMPLETE', application: 'REVIEW_COMPLETED', portfolio: 'COMPLETE', officer: 'officer-2', retrievedDaysAgo: 20, announcement: 'PENDING', casper: 'ATTENDED' },
  { pool: 'pool-res-im', verification: 'COMPLETE', application: 'REVIEW_COMPLETED', portfolio: 'COMPLETE', officer: 'officer', retrievedDaysAgo: 21, announcement: 'PENDING', casper: 'ATTENDED' },
  { pool: 'pool-int-med', verification: 'COMPLETE', application: 'REVIEW_COMPLETED', portfolio: 'COMPLETE', officer: 'officer', retrievedDaysAgo: 22, announcement: 'PENDING', casper: 'NA' },
  { pool: 'pool-res-im', verification: 'COMPLETE', application: 'REVIEW_COMPLETED', portfolio: 'COMPLETE', officer: 'officer-2', retrievedDaysAgo: 25, announcement: 'ANNOUNCED', casper: 'ATTENDED' },
  { pool: 'pool-int-med', verification: 'COMPLETE', application: 'REVIEW_COMPLETED', portfolio: 'COMPLETE', officer: 'officer-2', retrievedDaysAgo: 26, announcement: 'READY_FOR_REANNOUNCEMENT', appealed: true, casper: 'ATTENDED' },
  { pool: 'pool-res-im', verification: 'SCREENED_OUT', application: 'SCREENED_OUT', portfolio: 'ON_HOLD', officer: 'officer', retrievedDaysAgo: 15, announcement: 'ANNOUNCED', casper: 'NA', screenOutReason: 'INCOMPLETE_APPLICATION' },
];

function reviewApplication(seed: Seed, index: number): MockReviewApplication {
  const pool = MOCK_POOLS.find(item => item.poolId === seed.pool) ?? MOCK_POOLS[0];
  const residency = pool?.programId === 'p-res-med';
  const weights = residency ? RESIDENCY_WEIGHTS : INTERNSHIP_WEIGHTS;
  const first = FIRST_NAMES[index % FIRST_NAMES.length] ?? 'Candidate';
  const last = LAST_NAMES[(index * 7) % LAST_NAMES.length] ?? String(index);
  const number = `2026${String(1000 + index * 37).padStart(7, '0')}`;
  const retrieved = seed.retrievedDaysAgo === undefined ? null : iso(-seed.retrievedDaysAgo);
  const verification = seed.verification;
  const gpa = Number((weights.gpa * (0.62 + ((index * 13) % 35) / 100)).toFixed(2));
  const exam = weights.exam === null ? null : Number((weights.exam * (0.55 + ((index * 11) % 40) / 100)).toFixed(2));
  const screening = seed.application === 'REVIEW_COMPLETED' || seed.application === 'SCREENED_OUT';
  const casper = seed.casper === 'ATTENDED' ? Number((weights.casper * (0.5 + ((index * 17) % 45) / 100)).toFixed(2)) : null;
  const portfolio = seed.portfolio === 'COMPLETE' ? Number((weights.portfolio * (0.45 + ((index * 19) % 50) / 100)).toFixed(2)) : null;
  const applicationId = `rv-${String(index + 1).padStart(4, '0')}`;
  const pending = verification === 'PENDING_CLARIFICATION' || verification === 'SCREEN_OUT_PENDING_APPROVAL';
  const notes: StaffNote[] = [];

  if (verification === 'PENDING_CLARIFICATION' || verification === 'CLARIFICATION_SUBMITTED') {
    notes.push({ noteType: 'ESCALATION', text: 'The graduation certificate date does not match the transcript. Please advise.', createdAt: iso(-2), authorDisplayName: 'Noura Al Hashimi' });
  }

  if (verification === 'CLARIFICATION_SUBMITTED') {
    notes.push({ noteType: 'SUPERVISOR_GUIDANCE', text: 'Accept the transcript date; the certificate shows the ceremony date.', createdAt: iso(-1), authorDisplayName: 'Khalid Rahman' });
  }

  if (verification === 'RE_EVALUATING') {
    notes.push({ noteType: 'SCREEN_OUT', text: 'Recommended screen-out: English certificate expired.', createdAt: iso(-3), authorDisplayName: 'Noura Al Hashimi' });
    notes.push({ noteType: 'SUPERVISOR_GUIDANCE', text: 'Rejected: the certificate was valid on the submission date. Continue verification.', createdAt: iso(-1), authorDisplayName: 'Khalid Rahman' });
  }

  return {
    applicationId,
    applicationNumber: number,
    candidateId: `cand-${applicationId}`,
    candidateName: `${first} ${last}`,
    programId: pool?.programId ?? 'p-res-med',
    programName: pool?.programName ?? 'Medical Residency',
    specialtyName: pool?.specialtyName ?? 'Internal Medicine',
    poolId: pool?.poolId ?? 'pool-res-im',
    submittedAt: iso(-30 + index * 0.5),
    retrievedAt: retrieved,
    // Due 5 working days (about a week) after retrieval.
    dueAt: retrieved === null ? null : iso(-(seed.retrievedDaysAgo ?? 0) + 7),
    assignedOfficerId: seed.officer ?? null,
    autoReturnedFrom: [],
    applicationStatus: seed.application ?? (verification === 'PENDING' ? 'SUBMITTED' : 'UNDER_REVIEW'),
    verificationStatus: verification,
    portfolioStatus: seed.portfolio ?? (verification === 'SCREENED_OUT' ? 'ON_HOLD' : 'IN_PROGRESS'),
    announcementStatus: seed.announcement ?? 'PENDING',
    previous: verification === 'SCREENED_OUT' ? { applicationStatus: 'UNDER_REVIEW', verificationStatus: 'IN_PROGRESS', portfolioStatus: 'IN_PROGRESS' } : null,
    gpaShortlistingScore: gpa,
    examShortlistingScore: exam,
    casperShortlistingScore: casper,
    casperAttendance: seed.casper ?? 'NA',
    portfolioScore: portfolio,
    weights,
    appealed: seed.appealed ?? false,
    reviewCompletedAt: screening ? iso(-5) : null,
    initialAnnouncedAt: seed.announcement === 'ANNOUNCED' || seed.announcement === 'READY_FOR_REANNOUNCEMENT' ? iso(-4) : null,
    reannouncedAt: null,
    screenOutReasonCode: seed.screenOutReason ?? null,
    sections: sectionsFor(first, last, residency, index),
    icpFieldPointers: index % 2 === 0 ? ICP_POINTERS : [],
    attachments: attachmentsFor(residency, index),
    flags: verification === 'CORRECTION_REQUIRED' || verification === 'CORRECTION_SUBMITTED' ? [SAMPLE_FLAG] : [],
    notes,
    screenOutRecommendation: verification === 'SCREEN_OUT_PENDING_APPROVAL' ? { reasonCode: 'NOT_MEETING_ENGLISH', note: 'IELTS overall 5.5, below the 6.0 minimum.' } : null,
    requestedAt: pending ? iso(-1.5 + index * 0.01) : null,
  };
}

const ICP_POINTERS = [
  '/sections/personal-information/values/firstNameEn',
  '/sections/personal-information/values/lastNameEn',
  '/sections/personal-information/values/dateOfBirth',
  '/sections/personal-information/values/nationality',
  '/sections/personal-information/values/emiratesIdNumber',
];

const SAMPLE_FLAG: CorrectionFlag = {
  fieldPointer: '/sections/academic-information/values/graduationYear',
  candidateNoteCode: 'MISMATCH',
  candidateNote: 'The graduation year does not match your certificate. Please correct it or upload the right certificate.',
};

function sectionsFor(first: string, last: string, residency: boolean, index: number): Record<string, Record<string, unknown>> {
  const sections: Record<string, Record<string, unknown>> = {
    'personal-information': {
      firstNameEn: first,
      lastNameEn: last,
      dateOfBirth: `199${index % 9}-0${(index % 8) + 1}-1${index % 9}`,
      gender: index % 2 === 0 ? 'Male' : 'Female',
      nationality: index % 3 === 0 ? 'United Arab Emirates' : 'Jordan',
      emiratesIdNumber: `784-199${index % 9}-${String(1234567 + index).slice(0, 7)}-1`,
      contactEmail: `${first.toLowerCase()}.${index}@example.com`,
      contactMobile: `+97150${String(1000000 + index * 7919).slice(0, 7)}`,
    },
    'academic-information': {
      country: 'United Arab Emirates',
      university: 'Mohammed Bin Rashid University of Medicine and Health Sciences',
      degree: 'MBBS',
      graduationYear: String(2019 + (index % 5)),
      gpaType: 'Scale of 4',
      gpa: (3 + (index % 10) / 10).toFixed(2),
    },
    'english-proficiency': { exam: 'Academic IELTS', dateTaken: '2025-10-02', result: (6.5 + (index % 3) / 2).toFixed(1) },
  };

  if (residency) {
    sections['internship-information'] = { organization: 'DHA', location: 'United Arab Emirates', fromDate: '2022-07-01', toDate: '2023-06-30' };
    sections['residency-entrance-exam'] = { examType: 'EMREE', attempt: 'First', examDate: '2025-10-15', percentileRank: String(60 + (index % 35)), score: String(65 + (index % 30)) };
  }

  return sections;
}

function attachmentsFor(residency: boolean, index: number): ApplicationAttachment[] {
  const list: [string, string, string][] = [
    ['personal-information', 'PASSPORT', 'Passport copy'],
    ['personal-information', 'EMIRATES_ID', 'Emirates ID (both sides)'],
    ['academic-information', 'GRADUATION_CERTIFICATE', 'Graduation certificate'],
    ['academic-information', 'TRANSCRIPT', 'Official transcript'],
    ['english-proficiency', 'ENGLISH_CERTIFICATE', 'English proficiency certificate'],
  ];

  if (residency) {
    list.push(['residency-entrance-exam', 'EXAM_RESULT', 'Entrance exam statement of result']);
  }

  return list.map(([sectionKey, documentTypeCode, label], position) => ({
    sectionKey,
    documentTypeCode,
    label,
    specialtyId: null,
    attachment: {
      attachmentId: `att-${index}-${position}`,
      version: 1,
      fileName: `${documentTypeCode.toLowerCase()}.pdf`,
      mediaType: 'application/pdf',
      sizeBytes: 180_000 + position * 21_000,
      uploadedAt: iso(-31),
    },
    previousVersionCount: 0,
  }));
}

export function seedAdmission(): MockAdmissionState {
  const applications = SEEDS.map((seed, index) => reviewApplication(seed, index));
  const withdrawnA = 'rv-wd-0001';
  const withdrawnB = 'rv-wd-0002';

  return {
    pools: [...MOCK_POOLS],
    officers: [
      { officerId: 'officer', name: 'Noura Al Hashimi', poolIds: ['pool-res-im', 'pool-int-med'] },
      { officerId: 'officer-2', name: 'Omar Khalifa', poolIds: ['pool-res-im', 'pool-int-med'] },
      { officerId: 'officer-3', name: 'Fatma Al Ali', poolIds: ['pool-res-im'] },
    ],
    applications,
    reinstatements: [
      {
        requestId: 'ri-0001',
        applicationId: withdrawnA,
        applicationNumber: '20260004401',
        candidateName: 'Hamad Al Marri',
        programName: 'Medical Residency',
        requestedAt: iso(-3),
        status: 'SUBMITTED',
        withdrawalReasonCode: 'PERSONAL_REASONS',
        withdrawnAt: iso(-6),
        justification: 'My family situation has been resolved and I can now commit to the full training program.',
        previousStatus: 'UNDER_REVIEW',
        decision: null,
      },
      {
        requestId: 'ri-0002',
        applicationId: withdrawnB,
        applicationNumber: '20260004457',
        candidateName: 'Amna Al Zaabi',
        programName: 'Medical Internship',
        requestedAt: iso(-1),
        status: 'SUBMITTED',
        withdrawalReasonCode: 'JOINING_ANOTHER_PROGRAM',
        withdrawnAt: iso(-4),
        justification: 'The other program offer was withdrawn, so I would like to continue with this application.',
        previousStatus: 'SUBMITTED',
        decision: null,
      },
      {
        requestId: 'ri-0003',
        applicationId: 'rv-wd-0003',
        applicationNumber: '20260003320',
        candidateName: 'Saif Al Hammadi',
        programName: 'Fellowship',
        requestedAt: iso(-12),
        status: 'APPROVED',
        withdrawalReasonCode: 'FINANCIAL_REASONS',
        withdrawnAt: iso(-14),
        justification: 'I have secured sponsorship and can continue.',
        previousStatus: 'SUBMITTED',
        decision: { decision: 'APPROVE', reasonCode: null, note: 'Sponsorship letter seen.', decidedAt: iso(-11), decidedByDisplayName: 'Khalid Rahman' },
      },
    ],
    duplicates: [
      {
        pairId: 'dup-0001',
        detectedAt: iso(-2),
        matchedOn: ['EMIRATES_ID', 'MOBILE'],
        original: { candidateId: 'cand-dup-1a', candidateNumber: '000123401', displayName: 'Mohammed Al Mansoori', createdAt: iso(-90) },
        duplicate: { candidateId: 'cand-dup-1b', candidateNumber: '000187322', displayName: 'Mohamed Almansoori', createdAt: iso(-2) },
      },
      {
        pairId: 'dup-0002',
        detectedAt: iso(-8),
        matchedOn: ['PASSPORT'],
        original: { candidateId: 'cand-dup-2a', candidateNumber: '000144210', displayName: 'Rania Khoury', createdAt: iso(-60) },
        duplicate: { candidateId: 'cand-dup-2b', candidateNumber: '000179005', displayName: 'Rania Al Khoury', createdAt: iso(-8) },
      },
    ],
    casperUploadVersion: 0,
  };
}

export const MOCK_LOOKUPS: Readonly<Record<string, readonly { code: string; label: string }[]>> = {
  CORRECTION_NOTE_TEMPLATE: [
    { code: 'MISSING_DOCUMENT', label: 'Document missing or unreadable' },
    { code: 'MISMATCH', label: 'Information does not match the document' },
    { code: 'EXPIRED_DOCUMENT', label: 'Document has expired' },
    { code: 'OTHER', label: 'Other' },
  ],
  SCREEN_OUT_REASON: [
    { code: 'NOT_MEETING_CRITERIA', label: 'Not meeting published admission criteria' },
    { code: 'INCOMPLETE_APPLICATION', label: 'Incomplete application' },
    { code: 'NOT_ATTENDING_CASPER', label: 'Not attending CASPER' },
    { code: 'MISSING_ECE', label: 'Incomplete - missing ECE report' },
    { code: 'MISSING_ENGLISH', label: 'Incomplete - missing English certificate' },
    { code: 'NOT_MEETING_ENGLISH', label: 'Not meeting English requirements' },
    { code: 'LIMITED_SEATS', label: 'Limited seats / competitive pool' },
    { code: 'BELOW_THRESHOLD', label: 'Shortlisting-phase performance below threshold' },
  ],
  REINSTATEMENT_REJECTION_REASON: [
    { code: 'ACTIVE_APPLICATION_EXISTS', label: 'Another active application exists in this cycle' },
    { code: 'CYCLE_CLOSED', label: 'The admission cycle has closed' },
    { code: 'JUSTIFICATION_INSUFFICIENT', label: 'The justification is not sufficient' },
  ],
};

export const MOCK_REVIEW_CYCLE_ID = MOCK_CYCLE.id;
