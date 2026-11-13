import { ApplicationSectionKey, PortfolioAnswer, SectionValues } from '../api/candidate-lifecycle.models';
import { DahcSignInPersona } from '../core/auth/alternative-sign-in';
import {
  AcademicInformationValues,
  ApplicationInformationValues,
  BoardLicenseValues,
  EnglishProficiencyValues,
  EntranceExamValues,
  IdentityValues,
  InternshipInformationValues,
  PersonalInformationValues,
  ResidencyInformationValues,
} from '../shared/section-values';
import { MOCK_CYCLE } from './mock-catalog';
import { MockApplication, MockCandidate, MockDatabase, MockSection } from './mock-store';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function isoFromNow(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

export const MOCK_PERSONAS: readonly DahcSignInPersona[] = [
  {
    id: 'new-candidate',
    name: 'Mohammed Al Mansoori',
    description: 'First visit: no applications yet, signed in with UAE Pass (identity pre-filled from ICP).',
  },
  {
    id: 'draft-in-progress',
    name: 'Aisha Khan',
    description: 'Medical Residency draft with the first steps filled in; signed in with a Dubai Health account.',
  },
  {
    id: 'submitted',
    name: 'Mohamed Hazim',
    description: 'Submitted Medical Residency application; preferences can still be edited.',
  },
  {
    id: 'scores-announced',
    name: 'Fatima Al Suwaidi',
    description: 'Fellowship application with announced scores and an open appeal window.',
  },
  {
    id: 'withdrawn',
    name: 'Omar Haddad',
    description: 'Withdrawn Dental Residency application; can request reinstatement or start again.',
  },
  {
    id: 'staff-user',
    name: 'Staff member',
    description: 'An admission officer account: the candidate portal is not available to staff.',
  },
];

const EMPTY_IDENTITY: IdentityValues = {
  firstNameEn: '',
  middleNameEn: '',
  lastNameEn: '',
  firstNameAr: '',
  middleNameAr: '',
  lastNameAr: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  nationality: '',
  countryOfBirth: '',
  childOfUaeMother: '',
  hasMarsoom: '',
  countryOfResidence: '',
  cityOfResidence: '',
  hasEmiratesId: '',
  emiratesIdNumber: '',
  emiratesIdExpiry: '',
  visaUnifiedNumber: '',
  visaFileNumber: '',
  visaPlaceOfIssue: '',
  visaExpiry: '',
  passportNumber: '',
  passportCountry: '',
  passportIssueDate: '',
  passportExpiry: '',
  passportCity: '',
  familyBookCityNumber: '',
  familyId: '',
  passportUnifiedNumber: '',
};

const EMPTY_NEXT_OF_KIN = {
  firstName: '',
  middleName: '',
  surname: '',
  relationship: '',
  phone: '',
  email: '',
  confirmEmail: '',
  areaOfResidence: '',
};

function profile(identity: Partial<IdentityValues>, email: string, mobile: string, complete: boolean): PersonalInformationValues {
  return {
    identity: { ...EMPTY_IDENTITY, ...identity },
    contact: { registeredEmail: email, registeredMobile: mobile, contactEmail: email, contactMobile: mobile },
    nextOfKin: complete
      ? {
          firstName: 'Sara',
          middleName: '',
          surname: 'Hazim',
          relationship: 'SPOUSE',
          phone: '+971501234999',
          email: 'sara.hazim@example.com',
          confirmEmail: 'sara.hazim@example.com',
          areaOfResidence: 'Al Barsha, Dubai',
        }
      : EMPTY_NEXT_OF_KIN,
  };
}

/** Identity of an expatriate UAE resident with an Emirates ID (Figma 1:2781 sample). */
function residentIdentity(first: string, last: string, gender: string, nationality: string): Partial<IdentityValues> {
  return {
    firstNameEn: first,
    lastNameEn: last,
    dateOfBirth: '1996-03-14',
    gender,
    maritalStatus: 'SINGLE',
    nationality,
    countryOfBirth: nationality,
    childOfUaeMother: 'NO',
    hasMarsoom: 'NO',
    countryOfResidence: 'AE',
    cityOfResidence: 'Dubai',
    hasEmiratesId: 'YES',
    emiratesIdNumber: '784-1996-1234567-1',
    emiratesIdExpiry: '2028-10-23',
    visaUnifiedNumber: '1234353556',
    visaFileNumber: '201/2024/1234567',
    visaPlaceOfIssue: 'Dubai',
    visaExpiry: '2028-10-23',
    passportNumber: 'N1234567',
    passportCountry: nationality,
    passportIssueDate: '2022-01-10',
    passportExpiry: '2032-01-09',
    passportCity: 'Amman',
  };
}

const ICP_FIELDS = [
  'identity.firstNameEn',
  'identity.middleNameEn',
  'identity.lastNameEn',
  'identity.dateOfBirth',
  'identity.gender',
  'identity.nationality',
  'identity.countryOfResidence',
  'identity.emiratesIdNumber',
  'identity.emiratesIdExpiry',
  'identity.visaUnifiedNumber',
  'identity.passportNumber',
];

function section(values: object): MockSection {
  return { values: values as SectionValues, version: 1 };
}

function applicationInformation(complete: boolean): ApplicationInformationValues {
  return {
    candidateStatus: 'DH_EMPLOYEE',
    idNumber: complete ? '231423' : '',
    sponsorship: 'NO',
    sponsorType: '',
    sponsorName: '',
    currentlyEmployed: complete ? 'NO' : '',
    registeredInMbruResidency: complete ? 'NO' : '',
    licenseDenied: 'NO',
    academicProbation: 'NO',
    dismissed: 'NO',
    misconduct: 'NO',
    termsAccepted: complete,
  };
}

const ACADEMIC: AcademicInformationValues = {
  country: 'AE',
  university: 'Mohammed Bin Rashid University of Medicine and Health Sciences',
  otherUniversity: '',
  degree: 'MBBS',
  graduationYear: '2021',
  graduationMonth: '6',
  gpaType: 'SCALE_4',
  gpaScale4: '3.40',
  gpaPercentage: '',
  eceGpa: '',
  originalGpa: '',
};

const ENGLISH: EnglishProficiencyValues = {
  exam: 'IELTS',
  dateTaken: '2025-11-02',
  result: '7.5',
  oetReading: '',
  oetWriting: '',
  oetListening: '',
  oetSpeaking: '',
};

const INTERNSHIP: InternshipInformationValues = {
  organization: 'DHA',
  otherOrganization: '',
  location: 'AE',
  fromDate: '2021-07-01',
  toDate: '2022-06-30',
};

const RESIDENCY: ResidencyInformationValues = {
  specialty: 'Internal Medicine',
  trainingHospital: 'Dubai Health Hospitals (MBRU)',
  otherTrainingHospital: '',
  trainingCountry: 'AE',
  completionDate: '2026-06-30',
};

const BOARD: BoardLicenseValues = {
  boards: [
    {
      boardName: 'Arab Board of Health Specializations',
      satWrittenExam: 'YES',
      scheduledExamDate: '',
      examDate: '2026-04-12',
      examResult: 'PASS',
      writtenAttempt: '1',
      osceDate: '2026-05-20',
      osceAttempt: '1',
      resitDate: '',
    },
  ],
  authority: 'DHA',
  otherAuthority: '',
  licenseNumber: 'DHA-P-0123456',
  jobTitle: 'SPECIALIST',
  otherJobTitle: '',
};

const EXAM: EntranceExamValues = {
  examType: 'EMREE',
  attempt: 'FIRST',
  examDate: '2025-10-15',
  percentileRank: '82',
  score: '78',
};

function completeSections(keys: readonly ApplicationSectionKey[]): MockApplication['sections'] {
  const all: Record<ApplicationSectionKey, object> = {
    'application-information': applicationInformation(true),
    'personal-information': {},
    'academic-information': ACADEMIC,
    'english-proficiency': ENGLISH,
    'internship-information': INTERNSHIP,
    'residency-information': RESIDENCY,
    'board-license-information': BOARD,
    'residency-entrance-exam': EXAM,
  };

  return Object.fromEntries(keys.filter(key => key !== 'personal-information').map(key => [key, section(all[key])]));
}

function file(name: string, sizeBytes: number, uploadedAt: string): MockApplication['attachments'][string] {
  return {
    attachmentId: crypto.randomUUID(),
    version: 1,
    fileName: name,
    mediaType: name.endsWith('.jpg') ? 'image/jpeg' : 'application/pdf',
    sizeBytes,
    uploadedAt,
  };
}

function application(partial: Partial<MockApplication> & Pick<MockApplication, 'id' | 'applicationNumber' | 'programId'>): MockApplication {
  return {
    status: 'DRAFT',
    previousStatus: null,
    createdAt: isoFromNow(-20 * DAY),
    submittedAt: null,
    version: 1,
    preferences: [],
    sections: {},
    attachments: {},
    portfolio: null,
    paymentSessions: [],
    announcedScores: null,
    appeal: null,
    editPreferencesOpen: false,
    reinstatementRequestedAt: null,
    excludedSiteIds: [],
    ...partial,
  };
}

function candidate(partial: Partial<MockCandidate> & Pick<MockCandidate, 'userId' | 'displayName' | 'email' | 'mobile' | 'profile'>): MockCandidate {
  return {
    userType: 'CANDIDATE',
    candidateNumber: '000' + String(Math.abs(hash(partial.userId)) % 1_000_000).padStart(6, '0'),
    signInMethod: 'IDAM',
    profileVersion: 1,
    icpFields: [],
    verifiedContacts: [],
    applications: [],
    ...partial,
  };
}

function hash(text: string): number {
  return [...text].reduce((value, character) => (value * 31 + character.charCodeAt(0)) | 0, 7);
}

function submittedAttachments(uploadedAt: string): MockApplication['attachments'] {
  return {
    'application-information:CV': file('CV.pdf', 420_000, uploadedAt),
    'personal-information:PHOTO': file('Photo.jpg', 180_000, uploadedAt),
    'personal-information:PASSPORT': file('Passport.pdf', 650_000, uploadedAt),
    'academic-information:GRADUATION_CERTIFICATE': file('Graduation_certificate.pdf', 800_000, uploadedAt),
    'academic-information:TRANSCRIPT': file('Transcript.pdf', 1_200_000, uploadedAt),
  };
}

const NO_ANSWERS = (ids: readonly string[]): PortfolioAnswer[] => ids.map(questionId => ({ questionId, answer: 'NO' }));

export function seedDatabase(): MockDatabase {
  const now = Date.now();

  const newCandidate = candidate({
    userId: 'new-candidate',
    displayName: 'Mohammed Al Mansoori',
    email: 'mohammed.almansoori@example.com',
    mobile: '+971501112233',
    signInMethod: 'UAE_PASS',
    icpFields: ICP_FIELDS,
    profile: profile(
      {
        ...residentIdentity('Mohammed', 'Al Mansoori', 'MALE', 'AE'),
        middleNameEn: 'Saeed',
        firstNameAr: 'محمد',
        lastNameAr: 'المنصوري',
        visaUnifiedNumber: '',
        visaFileNumber: '',
        visaPlaceOfIssue: '',
        visaExpiry: '',
        passportCity: 'Dubai',
        familyBookCityNumber: '201',
        familyId: '12345',
        passportUnifiedNumber: '',
      },
      'mohammed.almansoori@example.com',
      '+971501112233',
      false,
    ),
  });

  const draftCandidate = candidate({
    userId: 'draft-in-progress',
    displayName: 'Aisha Khan',
    email: 'aisha.khan@example.com',
    mobile: '+971502223344',
    profile: profile({ ...residentIdentity('Aisha', 'Khan', 'FEMALE', 'JO'), passportCity: 'Amman' }, 'aisha.khan@example.com', '+971502223344', false),
    applications: [
      application({
        id: 'a-draft-0001',
        applicationNumber: '20260000123',
        programId: 'p-res-med',
        createdAt: isoFromNow(-5 * DAY),
        preferences: [
          {
            specialtyId: 'sp-im',
            preferenceOrder: 1,
            trainingSites: [
              { siteId: 's-rashid', siteOrder: 1 },
              { siteId: 's-latifa', siteOrder: 2 },
            ],
          },
          {
            specialtyId: 'sp-fm',
            preferenceOrder: 2,
            trainingSites: [
              { siteId: 's-dubai', siteOrder: 1 },
              { siteId: 's-latifa', siteOrder: 2 },
            ],
          },
        ],
        sections: { 'application-information': section(applicationInformation(false)) },
      }),
    ],
  });

  const submittedAt = isoFromNow(-3 * DAY);
  const submittedCandidate = candidate({
    userId: 'submitted',
    displayName: 'Mohamed Hazim',
    email: 'mohamed.hazim@example.com',
    mobile: '+971503334455',
    profile: profile(residentIdentity('Mohamed', 'Hazim', 'MALE', 'EG'), 'mohamed.hazim@example.com', '+971503334455', true),
    applications: [
      application({
        id: 'a-sub-0001',
        applicationNumber: '20260000187',
        programId: 'p-res-med',
        status: 'SUBMITTED',
        createdAt: isoFromNow(-12 * DAY),
        submittedAt,
        preferences: [
          {
            specialtyId: 'sp-im',
            preferenceOrder: 1,
            trainingSites: [
              { siteId: 's-rashid', siteOrder: 1 },
              { siteId: 's-latifa', siteOrder: 2 },
            ],
          },
          {
            specialtyId: 'sp-fm',
            preferenceOrder: 2,
            trainingSites: [
              { siteId: 's-dubai', siteOrder: 1 },
              { siteId: 's-latifa', siteOrder: 2 },
            ],
          },
        ],
        sections: completeSections([
          'application-information',
          'academic-information',
          'english-proficiency',
          'internship-information',
          'residency-entrance-exam',
        ]),
        attachments: submittedAttachments(submittedAt),
        portfolio: { submittedAt, answers: NO_ANSWERS(['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10']) },
        paymentSessions: [
          {
            id: 'ps-sub-0001',
            applicationId: 'a-sub-0001',
            amount: 650,
            currency: 'AED',
            status: 'PAID',
            receiptId: 'RCP-2026-004517',
            paymentDate: submittedAt,
          },
        ],
        editPreferencesOpen: true,
      }),
    ],
  });

  const announcedAt = new Date(now - 6 * HOUR).toISOString();
  const fellowSubmittedAt = isoFromNow(-40 * DAY);
  const announcedCandidate = candidate({
    userId: 'scores-announced',
    displayName: 'Fatima Al Suwaidi',
    email: 'fatima.alsuwaidi@example.com',
    mobile: '+971504445566',
    profile: profile(
      { ...residentIdentity('Fatima', 'Al Suwaidi', 'FEMALE', 'AE'), visaUnifiedNumber: '', visaFileNumber: '', visaPlaceOfIssue: '', visaExpiry: '', passportCity: 'Dubai', familyBookCityNumber: '305', familyId: '67890' },
      'fatima.alsuwaidi@example.com',
      '+971504445566',
      true,
    ),
    applications: [
      application({
        id: 'a-fel-0001',
        applicationNumber: '20260000042',
        programId: 'p-fel',
        status: 'REVIEW_COMPLETED',
        createdAt: isoFromNow(-50 * DAY),
        submittedAt: fellowSubmittedAt,
        preferences: [
          {
            specialtyId: 'sp-card',
            preferenceOrder: 1,
            trainingSites: [
              { siteId: 's-rashid', siteOrder: 1 },
              { siteId: 's-dubai', siteOrder: 2 },
            ],
          },
          {
            specialtyId: 'sp-ccm',
            preferenceOrder: 2,
            trainingSites: [{ siteId: 's-dubai', siteOrder: 1 }],
          },
        ],
        sections: completeSections([
          'application-information',
          'academic-information',
          'english-proficiency',
          'internship-information',
          'residency-information',
          'board-license-information',
        ]),
        attachments: submittedAttachments(fellowSubmittedAt),
        portfolio: {
          submittedAt: fellowSubmittedAt,
          answers: [
            {
              questionId: 'FEL-Q1',
              answer: 'YES',
              details: {
                researchLink: 'https://doi.org/10.1000/example.2025.001',
                journal: 'Gulf Heart Journal',
                articleTitle: 'Outcomes of early PCI in young adults',
                publicationDate: '2025-02-14',
              },
            },
            { questionId: 'FEL-Q2', answer: 'NO' },
            {
              questionId: 'FEL-Q3',
              answer: 'YES',
              details: { activityName: 'Teaching junior residents', activityRole: 'Tutor', fromDate: '2024-01-01', toDate: '2025-06-30' },
            },
            { questionId: 'FEL-Q4', answer: 'NO' },
            {
              questionId: 'FEL-Q5',
              answer: 'YES',
              details: { activityProvider: 'Rashid Hospital', activityName: 'Sepsis audit', activityRole: 'Lead', activityDate: '2025-03-01' },
            },
            { questionId: 'FEL-Q6', answer: 'NO' },
          ],
        },
        paymentSessions: [
          {
            id: 'ps-fel-0001',
            applicationId: 'a-fel-0001',
            amount: 650,
            currency: 'AED',
            status: 'PAID',
            receiptId: 'RCP-2026-001204',
            paymentDate: fellowSubmittedAt,
          },
        ],
        announcedScores: {
          announcedAt,
          finalPortfolioScore: 10,
          shortlistingScore: 10,
          gpaShortlistingScore: null,
          examShortlistingScore: null,
          casperScore: null,
          appealDeadline: new Date(now + 42 * HOUR).toISOString(),
          reannouncedAt: null,
        },
      }),
    ],
  });

  const withdrawnCandidate = candidate({
    userId: 'withdrawn',
    displayName: 'Omar Haddad',
    email: 'omar.haddad@example.com',
    mobile: '+971505556677',
    profile: profile(residentIdentity('Omar', 'Haddad', 'MALE', 'LB'), 'omar.haddad@example.com', '+971505556677', true),
    applications: [
      application({
        id: 'a-wd-0001',
        applicationNumber: '20260000098',
        programId: 'p-res-den',
        status: 'WITHDRAWN',
        previousStatus: 'SUBMITTED',
        createdAt: isoFromNow(-30 * DAY),
        submittedAt: isoFromNow(-25 * DAY),
        preferences: [{ specialtyId: 'sp-ortho', preferenceOrder: 1, trainingSites: [{ siteId: 's-dental', siteOrder: 1 }] }],
        sections: completeSections(['application-information', 'academic-information', 'english-proficiency', 'internship-information', 'residency-entrance-exam']),
        attachments: submittedAttachments(isoFromNow(-25 * DAY)),
        portfolio: { submittedAt: isoFromNow(-25 * DAY), answers: NO_ANSWERS(['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10']) },
      }),
    ],
  });

  const staff = candidate({
    userId: 'staff-user',
    userType: 'STAFF',
    candidateNumber: null,
    displayName: 'Staff member',
    email: 'officer@example.com',
    mobile: '+971500000000',
    profile: profile({}, 'officer@example.com', '+971500000000', false),
  });

  const candidates = [newCandidate, draftCandidate, submittedCandidate, announcedCandidate, withdrawnCandidate, staff];

  return { candidates: Object.fromEntries(candidates.map(item => [item.userId, item])), sequence: 200 };
}

export { MOCK_CYCLE };
