// Labels of the fields a correction flag can point to, keyed by section key and field path as in the
// flag's JSON Pointer (`/sections/<key>/values/<path>`). Each label reuses the step template's i18n id
// with identical text, so translations stay in one place. Generated from the step templates.

/** The display label of a flagged field, or null when it is not a known field (US-2.3.4). */
export function correctionFieldLabel(pointerPath: string): string | null {
  switch (pointerPath) {
    case 'application-information/candidateStatus':
      return $localize`:@@portal.info.candidateStatus:Candidate Status`;
    case 'application-information/idNumber':
      return $localize`:@@portal.info.idNumber:ID number`;
    case 'application-information/sponsorship':
      return $localize`:@@portal.info.sponsorship:Will an external entity or your employer sponsor your training?`;
    case 'application-information/sponsorType':
      return $localize`:@@portal.info.sponsorType:Sponsor type`;
    case 'application-information/sponsorName':
      return $localize`:@@portal.info.sponsorName:Sponsor name`;
    case 'application-information/currentlyEmployed':
      return $localize`:@@portal.info.employed:Are you currently employed?`;
    case 'application-information/registeredInMbruResidency':
      return $localize`:@@portal.info.mbruResidency:Are you currently registered in the MBRU Residency Program?`;
    case 'academic-information/country':
      return $localize`:@@portal.academic.country:Country`;
    case 'academic-information/university':
      return $localize`:@@portal.academic.university:University`;
    case 'academic-information/otherUniversity':
      return $localize`:@@portal.academic.otherUniversity:University name`;
    case 'academic-information/degree':
      return $localize`:@@portal.academic.degree:Degree`;
    case 'academic-information/graduationYear':
      return $localize`:@@portal.academic.graduationYear:Graduation year`;
    case 'academic-information/graduationMonth':
      return $localize`:@@portal.academic.graduationMonth:Graduation month`;
    case 'academic-information/gpaType':
      return $localize`:@@portal.academic.gpaType:GPA Type`;
    case 'academic-information/gpaScale4':
      return $localize`:@@portal.academic.gpaScale4:GPA (scale of 4)`;
    case 'academic-information/gpaPercentage':
      return $localize`:@@portal.academic.gpaPercentage:GPA (percentage)`;
    case 'academic-information/eceGpa':
      return $localize`:@@portal.academic.eceGpa:ECE GPA (scale of 4)`;
    case 'academic-information/originalGpa':
      return $localize`:@@portal.academic.originalGpa:Original GPA`;
    case 'english-proficiency/exam':
      return $localize`:@@portal.english.exam:Title of exam`;
    case 'english-proficiency/dateTaken':
      return $localize`:@@portal.english.dateTaken:Date taken`;
    case 'english-proficiency/result':
      return $localize`:@@portal.english.result:Result`;
    case 'internship-information/organization':
      return $localize`:@@portal.internship.organization:Organization name`;
    case 'internship-information/otherOrganization':
      return $localize`:@@portal.internship.otherOrganization:Other organization name`;
    case 'internship-information/location':
      return $localize`:@@portal.internship.location:Location`;
    case 'internship-information/fromDate':
      return $localize`:@@portal.internship.fromDate:From date`;
    case 'internship-information/toDate':
      return $localize`:@@portal.internship.toDate:To date`;
    case 'residency-information/specialty':
      return $localize`:@@portal.residency.specialty:Specialty`;
    case 'residency-information/trainingHospital':
      return $localize`:@@portal.residency.hospital:Training hospital`;
    case 'residency-information/otherTrainingHospital':
      return $localize`:@@portal.residency.otherHospital:Other training hospital`;
    case 'residency-information/trainingCountry':
      return $localize`:@@portal.residency.country:Training country`;
    case 'residency-information/completionDate':
      return $localize`:@@portal.residency.completionDate:Completion date`;
    case 'board-license-information/boardName':
      return $localize`:@@portal.board.boardName:Board name`;
    case 'board-license-information/satWrittenExam':
      return $localize`:@@portal.board.satExam:Did you sit the final written exam?`;
    case 'board-license-information/scheduledExamDate':
      return $localize`:@@portal.board.scheduledDate:Scheduled exam date`;
    case 'board-license-information/examDate':
      return $localize`:@@portal.board.examDate:Exam date`;
    case 'board-license-information/examResult':
      return $localize`:@@portal.board.examResult:Exam result`;
    case 'board-license-information/writtenAttempt':
      return $localize`:@@portal.board.writtenAttempt:Written exam attempt number`;
    case 'board-license-information/osceDate':
      return $localize`:@@portal.board.osceDate:OSCE exam date`;
    case 'board-license-information/osceAttempt':
      return $localize`:@@portal.board.osceAttempt:OSCE exam attempt number`;
    case 'board-license-information/resitDate':
      return $localize`:@@portal.board.resitDate:Resit date`;
    case 'board-license-information/authority':
      return $localize`:@@portal.board.authority:Authority`;
    case 'board-license-information/otherAuthority':
      return $localize`:@@portal.board.otherAuthority:Other authority`;
    case 'board-license-information/licenseNumber':
      return $localize`:@@portal.board.licenseNumber:License number`;
    case 'board-license-information/jobTitle':
      return $localize`:@@portal.board.jobTitle:Job title`;
    case 'board-license-information/otherJobTitle':
      return $localize`:@@portal.board.otherJobTitle:Other job title`;
    case 'residency-entrance-exam/examType':
      return $localize`:@@portal.exam.type:Exam`;
    case 'residency-entrance-exam/attempt':
      return $localize`:@@portal.exam.attempt:Attempt`;
    case 'residency-entrance-exam/examDate':
      return $localize`:@@portal.exam.date:Examination date`;
    case 'residency-entrance-exam/percentileRank':
      return $localize`:@@portal.exam.percentile:Percentile rank`;
    case 'residency-entrance-exam/score':
      return $localize`:@@portal.exam.score:Score`;
    case 'personal-information/identity/dateOfBirth':
      return $localize`:@@portal.personal.dateOfBirth:Date of birth`;
    case 'personal-information/identity/gender':
      return $localize`:@@portal.personal.gender:Gender`;
    case 'personal-information/identity/maritalStatus':
      return $localize`:@@portal.personal.maritalStatus:Marital status`;
    case 'personal-information/identity/nationality':
      return $localize`:@@portal.personal.nationality:Nationality`;
    case 'personal-information/identity/countryOfBirth':
      return $localize`:@@portal.personal.countryOfBirth:Country of birth`;
    case 'personal-information/identity/childOfUaeMother':
      return $localize`:@@portal.personal.childOfUaeMother:Are you a child of a UAE National mother who holds a Family Book?`;
    case 'personal-information/identity/hasMarsoom':
      return $localize`:@@portal.personal.hasMarsoom:Do you have Marsoom?`;
    case 'personal-information/identity/countryOfResidence':
      return $localize`:@@portal.personal.countryOfResidence:Country of residence`;
    case 'personal-information/identity/cityOfResidence':
      return $localize`:@@portal.personal.cityOfResidence:UAE city of residence`;
    case 'personal-information/identity/hasEmiratesId':
      return $localize`:@@portal.personal.hasEmiratesId:Do you have an Emirates ID?`;
    case 'personal-information/identity/emiratesIdNumber':
      return $localize`:@@portal.personal.emiratesIdNumber:Emirates ID number`;
    case 'personal-information/identity/emiratesIdExpiry':
      return $localize`:@@portal.personal.emiratesIdExpiry:Emirates ID date of expiry`;
    case 'personal-information/identity/visaUnifiedNumber':
      return $localize`:@@portal.personal.visaUnifiedNumber:Visa unified number`;
    case 'personal-information/identity/visaFileNumber':
      return $localize`:@@portal.personal.visaFileNumber:Visa file number`;
    case 'personal-information/identity/visaPlaceOfIssue':
      return $localize`:@@portal.personal.visaPlaceOfIssue:Visa place of issue`;
    case 'personal-information/identity/visaExpiry':
      return $localize`:@@portal.personal.visaExpiry:Visa expiry date`;
    case 'personal-information/identity/passportNumber':
      return $localize`:@@portal.personal.passportNumber:Passport number`;
    case 'personal-information/identity/passportCountry':
      return $localize`:@@portal.personal.passportCountry:Passport country of issue`;
    case 'personal-information/identity/passportIssueDate':
      return $localize`:@@portal.personal.passportIssueDate:Passport date of issue`;
    case 'personal-information/identity/passportExpiry':
      return $localize`:@@portal.personal.passportExpiry:Passport date of expiry`;
    case 'personal-information/identity/passportCity':
      return $localize`:@@portal.personal.passportCity:Passport city of issue`;
    case 'personal-information/identity/passportUnifiedNumber':
      return $localize`:@@portal.personal.passportUnifiedNumber:Passport unified number`;
    case 'personal-information/identity/familyBookCityNumber':
      return $localize`:@@portal.personal.familyBookCityNumber:Family book city number`;
    case 'personal-information/identity/familyId':
      return $localize`:@@portal.personal.familyId:Family ID (khulasat qaid)`;
    case 'personal-information/contact/registeredEmail':
      return $localize`:@@portal.personal.registeredEmail:Registered e-mail`;
    case 'personal-information/contact/registeredMobile':
      return $localize`:@@portal.personal.registeredMobile:Registered mobile number`;
    case 'personal-information/contact/contactEmail':
      return $localize`:@@portal.personal.contactEmail:Contact e-mail`;
    case 'personal-information/contact/contactMobile':
      return $localize`:@@portal.personal.contactMobile:Contact mobile number`;
    case 'personal-information/nextOfKin/firstName':
      return $localize`:@@portal.personal.kinFirstName:First name`;
    case 'personal-information/nextOfKin/middleName':
      return $localize`:@@portal.personal.kinMiddleName:Middle name`;
    case 'personal-information/nextOfKin/surname':
      return $localize`:@@portal.personal.kinSurname:Surname`;
    case 'personal-information/nextOfKin/relationship':
      return $localize`:@@portal.personal.kinRelationship:Relationship to candidate`;
    case 'personal-information/nextOfKin/phone':
      return $localize`:@@portal.personal.kinPhone:Primary telephone contact`;
    case 'personal-information/nextOfKin/email':
      return $localize`:@@portal.personal.kinEmail:Primary e-mail`;
    case 'personal-information/nextOfKin/confirmEmail':
      return $localize`:@@portal.personal.kinConfirmEmail:Confirm primary e-mail`;
    case 'personal-information/nextOfKin/areaOfResidence':
      return $localize`:@@portal.personal.kinArea:Area of residence`;
    default:
      return null;
  }
}
