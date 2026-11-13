import { Program } from '../api/catalog.models';

/**
 * Program variants of the GME admission (BRD SBRD:355-361, 380, 572, 601, 629, 650, 696, 772;
 * extract §3.1). The contract's Program.category cannot tell Medical, Dental and Pharmacy
 * residency apart and has no preference count or fee (OQ-25, OQ-C3), so the portal resolves the
 * variant from the program code (assumption A-02) and keeps every variant rule in this file.
 */
export type ProgramVariant =
  | 'medical-internship'
  | 'dental-internship'
  | 'certificate'
  | 'medical-residency'
  | 'dental-residency'
  | 'pharmacy-residency'
  | 'fellowship';

/** Wizard pages. Personal information is one contract section shown as four sub-steps (Figma 1:2781-1:3604). */
export type WizardStepId =
  | 'program'
  | 'application-information'
  | 'personal-identity'
  | 'personal-contact'
  | 'personal-next-of-kin'
  | 'personal-attachments'
  | 'academic-information'
  | 'english-proficiency'
  | 'internship-information'
  | 'residency-information'
  | 'board-license-information'
  | 'residency-entrance-exam'
  | 'portfolio'
  | 'pay-and-submit';

/** Stepper entries; personal-information groups the four personal sub-steps. */
export type WizardGroupId = Exclude<
  WizardStepId,
  'personal-identity' | 'personal-contact' | 'personal-next-of-kin' | 'personal-attachments'
> | 'personal-information';

export const PERSONAL_SUBSTEPS: readonly WizardStepId[] = [
  'personal-identity',
  'personal-contact',
  'personal-next-of-kin',
  'personal-attachments',
];

export type PortfolioSet = 'fellowship' | 'medical-internship' | 'dental-internship' | 'residency';

export type EntranceExamType = 'EMREE' | 'SMLE' | 'EDREE' | 'SDLE' | 'EPREE';

export interface CandidateStatusOption {
  readonly value: string;
  readonly label: string;
  /** The appendix marks these with "*": the ID number is required. */
  readonly idRequired: boolean;
}

export interface ProgramRules {
  readonly variant: ProgramVariant;
  readonly maxPreferences: 1 | 2;
  /** Stepper groups in order (Figma 9-step and 10-step variants, plus the BRD entrance exam). */
  readonly groups: readonly WizardGroupId[];
  readonly englishRequired: boolean;
  /** Employment and MBRU residency questions with their letters (Residency and Fellowship). */
  readonly employmentQuestions: boolean;
  readonly recommendationLetters: boolean;
  readonly candidateStatuses: readonly CandidateStatusOption[];
  readonly degrees: readonly string[];
  readonly entranceExams: readonly EntranceExamType[];
  readonly portfolioSet: PortfolioSet;
  /** Application fee in AED (SBRD:772). Certificate is not stated; it follows Dental Internship (A-06). */
  readonly feeAed: number;
  /** GPA weight in the shortlisting score; null where the program has none (Fellowship, OQ-C18). */
  readonly gpaWeight: number | null;
  readonly examWeight: number | null;
}

const STATUS = {
  mdStudent: { value: 'MBRU_MD_STUDENT_ALUMNI', label: $localize`:@@portal.status.mdStudent:MBRU MD Student/Alumni`, idRequired: true },
  gmeIntern: { value: 'MBRU_GME_INTERN', label: $localize`:@@portal.status.gmeIntern:MBRU GME Intern`, idRequired: true },
  gmeResident: { value: 'MBRU_GME_RESIDENT', label: $localize`:@@portal.status.gmeResident:MBRU GME Resident`, idRequired: true },
  employee: { value: 'DH_EMPLOYEE', label: $localize`:@@portal.status.employee:Active Dubai Health Employee`, idRequired: true },
  external: { value: 'EXTERNAL', label: $localize`:@@portal.status.external:External Candidate`, idRequired: false },
} satisfies Record<string, CandidateStatusOption>;

const DENTAL_DEGREES = ['BDS', 'DDS', 'DMD'];
const MEDICAL_DEGREES = ['MD', 'MBBS'];

const COMMON_START: readonly WizardGroupId[] = [
  'program',
  'application-information',
  'personal-information',
  'academic-information',
  'english-proficiency',
];

const RULES: Readonly<Record<ProgramVariant, ProgramRules>> = {
  'medical-internship': {
    variant: 'medical-internship',
    maxPreferences: 1,
    groups: [...COMMON_START, 'portfolio', 'pay-and-submit'],
    englishRequired: true,
    employmentQuestions: false,
    recommendationLetters: false,
    candidateStatuses: [STATUS.external],
    degrees: MEDICAL_DEGREES,
    entranceExams: [],
    portfolioSet: 'medical-internship',
    feeAed: 230,
    gpaWeight: 50,
    examWeight: null,
  },
  'dental-internship': {
    variant: 'dental-internship',
    maxPreferences: 1,
    groups: [...COMMON_START, 'portfolio', 'pay-and-submit'],
    englishRequired: true,
    employmentQuestions: false,
    recommendationLetters: false,
    candidateStatuses: [STATUS.external],
    degrees: DENTAL_DEGREES,
    entranceExams: [],
    portfolioSet: 'dental-internship',
    feeAed: 230,
    gpaWeight: 50,
    examWeight: null,
  },
  certificate: {
    variant: 'certificate',
    maxPreferences: 1,
    groups: [...COMMON_START, 'portfolio', 'pay-and-submit'],
    englishRequired: true,
    employmentQuestions: false,
    recommendationLetters: false,
    candidateStatuses: [STATUS.external],
    degrees: ['BSc Medical Laboratory Sciences', 'BSc Biomedical Sciences'],
    entranceExams: [],
    portfolioSet: 'dental-internship',
    feeAed: 230,
    gpaWeight: 50,
    examWeight: null,
  },
  'medical-residency': {
    variant: 'medical-residency',
    maxPreferences: 2,
    groups: [...COMMON_START, 'internship-information', 'residency-entrance-exam', 'portfolio', 'pay-and-submit'],
    englishRequired: true,
    employmentQuestions: true,
    recommendationLetters: true,
    candidateStatuses: [STATUS.mdStudent, STATUS.gmeIntern, STATUS.gmeResident, STATUS.employee, STATUS.external],
    degrees: MEDICAL_DEGREES,
    entranceExams: ['EMREE', 'SMLE'],
    portfolioSet: 'residency',
    feeAed: 650,
    gpaWeight: 35,
    examWeight: 35,
  },
  'dental-residency': {
    variant: 'dental-residency',
    maxPreferences: 2,
    groups: [...COMMON_START, 'internship-information', 'residency-entrance-exam', 'portfolio', 'pay-and-submit'],
    englishRequired: true,
    employmentQuestions: true,
    recommendationLetters: true,
    candidateStatuses: [STATUS.gmeIntern, STATUS.gmeResident, STATUS.employee, STATUS.external],
    degrees: DENTAL_DEGREES,
    entranceExams: ['EDREE', 'SDLE'],
    portfolioSet: 'residency',
    feeAed: 650,
    gpaWeight: 35,
    examWeight: 35,
  },
  'pharmacy-residency': {
    variant: 'pharmacy-residency',
    maxPreferences: 1,
    groups: [...COMMON_START, 'residency-entrance-exam', 'portfolio', 'pay-and-submit'],
    englishRequired: true,
    employmentQuestions: true,
    recommendationLetters: true,
    candidateStatuses: [STATUS.employee, STATUS.external],
    degrees: ['BSc Pharmacy', 'MSc Pharmacy'],
    entranceExams: ['EPREE'],
    portfolioSet: 'residency',
    feeAed: 650,
    // Pharmacy weights are not in the BRD appendix (OQ-C12); the residency weights are used.
    gpaWeight: 35,
    examWeight: 35,
  },
  fellowship: {
    variant: 'fellowship',
    maxPreferences: 2,
    groups: [
      ...COMMON_START,
      'internship-information',
      'residency-information',
      'board-license-information',
      'portfolio',
      'pay-and-submit',
    ],
    englishRequired: false,
    employmentQuestions: true,
    recommendationLetters: true,
    candidateStatuses: [STATUS.mdStudent, STATUS.gmeResident, STATUS.employee, STATUS.external],
    degrees: MEDICAL_DEGREES,
    entranceExams: [],
    portfolioSet: 'fellowship',
    feeAed: 650,
    gpaWeight: null,
    examWeight: null,
  },
};

export function programVariant(program: Pick<Program, 'category' | 'code'>): ProgramVariant {
  const code = program.code.toUpperCase();

  switch (program.category) {
    case 'CERTIFICATE':
      return 'certificate';
    case 'INTERNSHIP':
      return code.includes('DEN') ? 'dental-internship' : 'medical-internship';
    case 'FELLOWSHIP':
      return 'fellowship';
    case 'RESIDENCY':
      if (code.includes('DEN')) {
        return 'dental-residency';
      }

      return code.includes('PHA') ? 'pharmacy-residency' : 'medical-residency';
  }
}

export function programRules(program: Pick<Program, 'category' | 'code'>): ProgramRules {
  return RULES[programVariant(program)];
}

/** The wizard pages of a program, in order, with the personal group expanded to its sub-steps. */
export function wizardSteps(rules: ProgramRules): readonly WizardStepId[] {
  return rules.groups.flatMap(group => (group === 'personal-information' ? PERSONAL_SUBSTEPS : [group]));
}

export function stepGroup(step: WizardStepId): WizardGroupId {
  return PERSONAL_SUBSTEPS.includes(step) ? 'personal-information' : (step as WizardGroupId);
}

export function groupLabel(group: WizardGroupId): string {
  switch (group) {
    case 'program':
      return $localize`:@@portal.step.program:Program & Preferences`;
    case 'application-information':
      return $localize`:@@portal.step.applicationInformation:Application Information`;
    case 'personal-information':
      return $localize`:@@portal.step.personalInformation:Personal Information`;
    case 'academic-information':
      return $localize`:@@portal.step.academicInformation:University Grades`;
    case 'english-proficiency':
      return $localize`:@@portal.step.englishProficiency:English Proficiency`;
    case 'internship-information':
      return $localize`:@@portal.step.internshipInformation:Internship Information`;
    case 'residency-information':
      return $localize`:@@portal.step.residencyInformation:Residency Information`;
    case 'board-license-information':
      return $localize`:@@portal.step.boardLicense:Board & License`;
    case 'residency-entrance-exam':
      return $localize`:@@portal.step.entranceExam:Entrance Exam`;
    case 'portfolio':
      return $localize`:@@portal.step.portfolio:Portfolio`;
    case 'pay-and-submit':
      return $localize`:@@portal.step.payAndSubmit:Pay & Submit`;
  }
}

export function stepLabel(step: WizardStepId): string {
  switch (step) {
    case 'personal-identity':
      return $localize`:@@portal.step.identity:Identity`;
    case 'personal-contact':
      return $localize`:@@portal.step.contact:Contact Information`;
    case 'personal-next-of-kin':
      return $localize`:@@portal.step.nextOfKin:Next of Kin Information`;
    case 'personal-attachments':
      return $localize`:@@portal.step.identificationAttachments:Identification Attachments`;
    default:
      return groupLabel(stepGroup(step));
  }
}
