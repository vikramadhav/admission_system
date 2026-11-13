/**
 * Display labels for the read-only staff view of an application. Staff cannot read the
 * candidate form schema (getApplicationFormSchema is candidate-only), so known field codes have
 * labels here and other codes fall back to a readable form of the code (PQ-26).
 */

/** JSON Pointers used for correction flags (CorrectionFlag.fieldPointer, US-2.3.2). */
export function fieldPointer(sectionKey: string, fieldCode: string): string {
  return `/sections/${sectionKey}/values/${fieldCode}`;
}

export function sectionPointer(sectionKey: string): string {
  return `/sections/${sectionKey}`;
}

export function attachmentPointer(documentTypeCode: string): string {
  return `/attachments/${documentTypeCode}`;
}

export function sectionLabel(sectionKey: string): string {
  switch (sectionKey) {
    case 'application-information':
      return $localize`:@@portal.staffApplication.section.applicationInformation:Application information`;
    case 'personal-information':
      return $localize`:@@portal.staffApplication.section.personalInformation:Personal information`;
    case 'academic-information':
      return $localize`:@@portal.staffApplication.section.academicInformation:Academic information`;
    case 'english-proficiency':
      return $localize`:@@portal.staffApplication.section.englishProficiency:English proficiency`;
    case 'internship-information':
      return $localize`:@@portal.staffApplication.section.internship:Internship`;
    case 'residency-information':
      return $localize`:@@portal.staffApplication.section.residency:Residency`;
    case 'board-license-information':
      return $localize`:@@portal.staffApplication.section.boardLicense:Board and licence`;
    case 'residency-entrance-exam':
      return $localize`:@@portal.staffApplication.section.entranceExam:Entrance exam`;
    default:
      return humanize(sectionKey);
  }
}

const FIELD_LABELS: Readonly<Record<string, () => string>> = {
  firstNameEn: () => $localize`:@@portal.staffApplication.field.firstNameEn:First name (English)`,
  middleNameEn: () => $localize`:@@portal.staffApplication.field.middleNameEn:Middle name (English)`,
  lastNameEn: () => $localize`:@@portal.staffApplication.field.lastNameEn:Last name (English)`,
  dateOfBirth: () => $localize`:@@portal.staffApplication.field.dateOfBirth:Date of birth`,
  gender: () => $localize`:@@portal.staffApplication.field.gender:Gender`,
  nationality: () => $localize`:@@portal.staffApplication.field.nationality:Nationality`,
  emiratesIdNumber: () => $localize`:@@portal.staffApplication.field.emiratesIdNumber:Emirates ID number`,
  contactEmail: () => $localize`:@@portal.staffApplication.field.contactEmail:Contact email`,
  contactMobile: () => $localize`:@@portal.staffApplication.field.contactMobile:Contact mobile`,
  country: () => $localize`:@@portal.staffApplication.field.country:Country`,
  university: () => $localize`:@@portal.staffApplication.field.university:University`,
  degree: () => $localize`:@@portal.staffApplication.field.degree:Degree`,
  graduationYear: () => $localize`:@@portal.staffApplication.field.graduationYear:Graduation year`,
  gpaType: () => $localize`:@@portal.staffApplication.field.gpaType:GPA type`,
  gpa: () => $localize`:@@portal.staffApplication.field.gpa:GPA`,
  exam: () => $localize`:@@portal.staffApplication.field.exam:Exam`,
  dateTaken: () => $localize`:@@portal.staffApplication.field.dateTaken:Date taken`,
  result: () => $localize`:@@portal.staffApplication.field.result:Result`,
  organization: () => $localize`:@@portal.staffApplication.field.organization:Organization`,
  location: () => $localize`:@@portal.staffApplication.field.location:Location`,
  fromDate: () => $localize`:@@portal.staffApplication.field.fromDate:From`,
  toDate: () => $localize`:@@portal.staffApplication.field.toDate:To`,
  examType: () => $localize`:@@portal.staffApplication.field.examType:Exam type`,
  attempt: () => $localize`:@@portal.staffApplication.field.attempt:Attempt`,
  examDate: () => $localize`:@@portal.staffApplication.field.examDate:Exam date`,
  percentileRank: () => $localize`:@@portal.staffApplication.field.percentileRank:Percentile rank`,
  score: () => $localize`:@@portal.staffApplication.field.score:Score`,
};

export function fieldLabel(fieldCode: string): string {
  return FIELD_LABELS[fieldCode]?.() ?? humanize(fieldCode);
}

/** Training sites are never shown to admission staff (STP-2.1). */
export function isHiddenField(fieldCode: string): boolean {
  return /site/i.test(fieldCode);
}

/** A section value as text; nested objects and lists are flattened, empty values give ''. */
export function displayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? $localize`:@@portal.staffApplication.yes:Yes` : $localize`:@@portal.staffApplication.no:No`;
  }

  if (Array.isArray(value)) {
    return value.map(item => displayValue(item)).filter(text => text !== '').join('; ');
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !isHiddenField(key))
      .map(([key, item]) => `${fieldLabel(key)}: ${displayValue(item)}`)
      .join(', ');
  }

  return String(value);
}

function humanize(code: string): string {
  const words = code
    .replace(/[-_]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim();

  return words.charAt(0).toUpperCase() + words.slice(1);
}
