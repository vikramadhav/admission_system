/**
 * Values of each contract section as the portal sends them in ApplicationSectionInput.values.
 * The contract leaves field codes to the form schema (OQ-02), which is not defined yet, so these
 * camelCase codes are the portal's proposal (assumption A-03). Empty answers are ''.
 */

export type YesNo = 'YES' | 'NO' | '';

export interface ApplicationInformationValues {
  readonly candidateStatus: string;
  readonly idNumber: string;
  readonly sponsorship: YesNo;
  readonly sponsorType: string;
  readonly sponsorName: string;
  readonly currentlyEmployed: YesNo;
  readonly registeredInMbruResidency: YesNo;
  readonly licenseDenied: YesNo;
  readonly academicProbation: YesNo;
  readonly dismissed: YesNo;
  readonly misconduct: YesNo;
  readonly termsAccepted: boolean;
}

export interface IdentityValues {
  readonly firstNameEn: string;
  readonly middleNameEn: string;
  readonly lastNameEn: string;
  readonly firstNameAr: string;
  readonly middleNameAr: string;
  readonly lastNameAr: string;
  readonly dateOfBirth: string;
  readonly gender: string;
  readonly maritalStatus: string;
  readonly nationality: string;
  readonly countryOfBirth: string;
  readonly childOfUaeMother: YesNo;
  readonly hasMarsoom: YesNo;
  readonly countryOfResidence: string;
  readonly cityOfResidence: string;
  readonly hasEmiratesId: YesNo;
  readonly emiratesIdNumber: string;
  readonly emiratesIdExpiry: string;
  readonly visaUnifiedNumber: string;
  readonly visaFileNumber: string;
  readonly visaPlaceOfIssue: string;
  readonly visaExpiry: string;
  readonly passportNumber: string;
  readonly passportCountry: string;
  readonly passportIssueDate: string;
  readonly passportExpiry: string;
  readonly passportCity: string;
  readonly familyBookCityNumber: string;
  readonly familyId: string;
  readonly passportUnifiedNumber: string;
}

export interface ContactValues {
  readonly registeredEmail: string;
  readonly registeredMobile: string;
  readonly contactEmail: string;
  readonly contactMobile: string;
}

export interface NextOfKinValues {
  readonly firstName: string;
  readonly middleName: string;
  readonly surname: string;
  readonly relationship: string;
  readonly phone: string;
  readonly email: string;
  readonly confirmEmail: string;
  readonly areaOfResidence: string;
}

/** personal-information is one section (the candidate profile, D-10) shown as sub-steps. */
export interface PersonalInformationValues {
  readonly identity: IdentityValues;
  readonly contact: ContactValues;
  readonly nextOfKin: NextOfKinValues;
}

export interface AcademicInformationValues {
  readonly country: string;
  readonly university: string;
  readonly otherUniversity: string;
  readonly degree: string;
  readonly graduationYear: string;
  readonly graduationMonth: string;
  readonly gpaType: string;
  readonly gpaScale4: string;
  readonly gpaPercentage: string;
  readonly eceGpa: string;
  readonly originalGpa: string;
}

export interface EnglishProficiencyValues {
  readonly exam: string;
  readonly dateTaken: string;
  readonly result: string;
  readonly oetReading: string;
  readonly oetWriting: string;
  readonly oetListening: string;
  readonly oetSpeaking: string;
}

export interface InternshipInformationValues {
  readonly organization: string;
  readonly otherOrganization: string;
  readonly location: string;
  readonly fromDate: string;
  readonly toDate: string;
}

export interface ResidencyInformationValues {
  readonly specialty: string;
  readonly trainingHospital: string;
  readonly otherTrainingHospital: string;
  readonly trainingCountry: string;
  readonly completionDate: string;
}

export interface BoardEntryValues {
  readonly boardName: string;
  readonly satWrittenExam: YesNo;
  readonly scheduledExamDate: string;
  readonly examDate: string;
  readonly examResult: string;
  readonly writtenAttempt: string;
  readonly osceDate: string;
  readonly osceAttempt: string;
  readonly resitDate: string;
}

export interface BoardLicenseValues {
  readonly boards: readonly BoardEntryValues[];
  readonly authority: string;
  readonly otherAuthority: string;
  readonly licenseNumber: string;
  readonly jobTitle: string;
  readonly otherJobTitle: string;
}

export interface EntranceExamValues {
  readonly examType: string;
  readonly attempt: string;
  readonly examDate: string;
  readonly percentileRank: string;
  readonly score: string;
}

/** Reads a string member of untyped section values. */
export function valueOf(values: Readonly<Record<string, unknown>> | undefined, key: string): string {
  const value = values?.[key];

  return typeof value === 'string' ? value : '';
}

/** Reads a nested object member of untyped section values. */
export function groupOf(values: Readonly<Record<string, unknown>> | undefined, key: string): Readonly<Record<string, unknown>> {
  const value = values?.[key];

  return typeof value === 'object' && value !== null ? (value as Readonly<Record<string, unknown>>) : {};
}
