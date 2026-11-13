import { DahcRadioOption, DahcSelectOption } from 'dahc-ui';

/**
 * Option lists for the application form, taken from the BRD data dictionaries and appendix.
 * The contract will deliver localized options through the form schema or lookups (OQ-02,
 * assumption A-04); until then these lists are the single place to change them. Country and
 * university lists are samples: the BRD says "extract from current system".
 */

function options(values: readonly string[]): readonly DahcSelectOption[] {
  return values.map(value => ({ value, label: value }));
}

export const YES_NO: readonly DahcRadioOption[] = [
  { value: 'YES', label: $localize`:@@portal.option.yes:Yes` },
  { value: 'NO', label: $localize`:@@portal.option.no:No` },
];

export const COUNTRIES: readonly DahcSelectOption[] = [
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'OM', label: 'Oman' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'QA', label: 'Qatar' },
  { value: 'JO', label: 'Jordan' },
  { value: 'EG', label: 'Egypt' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'SY', label: 'Syria' },
  { value: 'SD', label: 'Sudan' },
  { value: 'IN', label: 'India' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PH', label: 'Philippines' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'IE', label: 'Ireland' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
];

export const GCC_COUNTRIES: readonly string[] = ['AE', 'SA', 'OM', 'KW', 'BH', 'QA'];

/** English is optional for these nationalities or university countries (SBRD:572). */
export const ENGLISH_EXEMPT_COUNTRIES: readonly string[] = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'];

export function countryName(code: string): string {
  return COUNTRIES.find(country => country.value === code)?.label ?? code;
}

export const EMIRATES: readonly DahcSelectOption[] = options([
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
]);

export const GENDERS: readonly DahcRadioOption[] = [
  { value: 'MALE', label: $localize`:@@portal.option.male:Male` },
  { value: 'FEMALE', label: $localize`:@@portal.option.female:Female` },
];

export const MARITAL_STATUSES: readonly DahcSelectOption[] = [
  { value: 'SINGLE', label: $localize`:@@portal.option.single:Single` },
  { value: 'MARRIED', label: $localize`:@@portal.option.married:Married` },
  { value: 'DIVORCED', label: $localize`:@@portal.option.divorced:Divorced` },
  { value: 'WIDOWED', label: $localize`:@@portal.option.widowed:Widowed` },
];

export const RELATIONSHIPS: readonly DahcSelectOption[] = [
  { value: 'SPOUSE', label: $localize`:@@portal.option.spouse:Spouse` },
  { value: 'PARENT', label: $localize`:@@portal.option.parent:Parent` },
  { value: 'SIBLING', label: $localize`:@@portal.option.sibling:Sibling` },
  { value: 'CHILD', label: $localize`:@@portal.option.child:Child` },
  { value: 'RELATIVE', label: $localize`:@@portal.option.relative:Other relative` },
  { value: 'FRIEND', label: $localize`:@@portal.option.friend:Friend` },
];

export const SPONSOR_TYPES: readonly DahcSelectOption[] = [
  { value: 'GOVERNMENTAL', label: $localize`:@@portal.option.governmental:Governmental` },
  { value: 'NON_GOVERNMENTAL', label: $localize`:@@portal.option.nonGovernmental:Non-Governmental` },
];

export const UNIVERSITIES: Readonly<Record<string, readonly string[]>> = {
  AE: [
    'Mohammed Bin Rashid University of Medicine and Health Sciences',
    'United Arab Emirates University',
    'University of Sharjah',
    'Gulf Medical University',
    'Ajman University',
    'Khalifa University',
  ],
  JO: ['University of Jordan', 'Jordan University of Science and Technology'],
  EG: ['Cairo University', 'Ain Shams University', 'Alexandria University'],
  IN: ['All India Institute of Medical Sciences', 'Manipal Academy of Higher Education'],
  PK: ['Aga Khan University', 'King Edward Medical University'],
  GB: ['University of Oxford', "King's College London", 'University of Edinburgh'],
  IE: ['Royal College of Surgeons in Ireland', 'Trinity College Dublin'],
  US: ['Johns Hopkins University', 'Harvard University'],
};

export const OTHER = 'OTHER';

export function universityOptions(countryCode: string): readonly DahcSelectOption[] {
  return [
    ...options(UNIVERSITIES[countryCode] ?? []),
    { value: OTHER, label: $localize`:@@portal.option.otherUniversity:Other university` },
  ];
}

export const GPA_TYPES: readonly DahcRadioOption[] = [
  { value: 'PERCENTAGE', label: $localize`:@@portal.option.percentage:Percentage` },
  { value: 'SCALE_4', label: $localize`:@@portal.option.scale4:Scale of 4` },
];

export function graduationYears(now = new Date()): readonly DahcSelectOption[] {
  const year = now.getFullYear();

  return Array.from({ length: 40 }, (_, index) => String(year - index)).map(value => ({ value, label: value }));
}

export function months(locale: string): readonly DahcSelectOption[] {
  const format = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });

  return Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: format.format(new Date(Date.UTC(2026, index, 1))),
  }));
}

export type EnglishExam = 'IELTS' | 'TOEFL_IBT' | 'OET' | 'EMSAT';

export const ENGLISH_EXAMS: readonly DahcSelectOption[] = [
  { value: 'IELTS', label: 'Academic IELTS' },
  { value: 'TOEFL_IBT', label: 'TOEFL iBT' },
  { value: 'OET', label: 'OET' },
  { value: 'EMSAT', label: 'EmSAT-English' },
];

export const INTERNSHIP_ORGANIZATIONS: readonly DahcSelectOption[] = [
  ...options(['MBRU', 'DHA', 'EHS', 'DoH AD', 'Gulf Medical University', 'Ajman University']),
  { value: OTHER, label: $localize`:@@portal.option.other:Other` },
];

/** Accepted UAE hospitals for residency (appendix), grouped by entity in the label. */
export const TRAINING_HOSPITALS: readonly DahcSelectOption[] = [
  ...options([
    'Dubai Health Hospitals (MBRU)',
    'Tawam Hospital (DoH)',
    'Ambulatory Health Services (DoH)',
    'Sheikh Khalifa Medical City (DoH)',
    'Sheikh Shakhbout Medical City (DoH)',
    'Sheikh Tahnoon Medical City (DoH)',
    'Corniche Hospital (DoH)',
    'Cleveland Clinic Abu Dhabi (DoH)',
    'Zayed Military Hospital (DoH)',
    'Burjeel Medical City (DoH)',
    "Al Qassimi Hospital (EHS)",
    "Al Qassimi Women's & Children's Hospital (EHS)",
    'Al Amal Psychiatric Hospital (EHS)',
    'EHS Primary Healthcare Centres (EHS)',
    'Kuwait Hospital (EHS)',
    'Thumbay University Hospital (GMU)',
  ]),
  { value: OTHER, label: $localize`:@@portal.option.otherHospital:Other training hospital` },
];

export const RESIDENCY_SPECIALTIES: readonly DahcSelectOption[] = options([
  'Internal Medicine',
  'Pediatrics',
  'Emergency Medicine',
  'General Surgery',
  'Anesthesia',
  'Psychiatry',
  'Neurology',
  'Otolaryngology',
  'Orthopedics & Trauma Surgery',
  'Family Medicine',
]);

export const BOARDS: readonly DahcSelectOption[] = options([
  'Arab Board of Health Specializations',
  'Saudi Board',
  'Emirates Board',
  'American Board',
  'Royal College (UK)',
  'Royal College of Physicians and Surgeons of Canada',
]);

export const ATTEMPTS: readonly DahcSelectOption[] = ['1', '2', '3', '4'].map(value => ({ value, label: value }));

export const EXAM_RESULTS: readonly DahcRadioOption[] = [
  { value: 'PASS', label: $localize`:@@portal.option.pass:Pass` },
  { value: 'FAIL', label: $localize`:@@portal.option.fail:Fail` },
];

export const LICENSE_AUTHORITIES: readonly DahcSelectOption[] = [
  ...options(['DHA', 'EHS', 'DoH']),
  { value: OTHER, label: $localize`:@@portal.option.other:Other` },
];

export const JOB_TITLES: readonly DahcSelectOption[] = [
  { value: 'RESIDENT', label: $localize`:@@portal.option.resident:Resident` },
  { value: 'SPECIALIST', label: $localize`:@@portal.option.specialist:Specialist` },
  { value: 'CONSULTANT', label: $localize`:@@portal.option.consultant:Consultant` },
  { value: OTHER, label: $localize`:@@portal.option.other:Other` },
];

export const EXAM_ATTEMPTS: readonly DahcSelectOption[] = [
  { value: 'FIRST', label: $localize`:@@portal.option.first:First` },
  { value: 'SECOND', label: $localize`:@@portal.option.second:Second` },
  { value: 'THIRD_OR_MORE', label: $localize`:@@portal.option.thirdOrMore:Third and beyond` },
];
