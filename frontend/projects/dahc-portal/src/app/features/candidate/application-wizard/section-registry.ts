import { ApplicationSectionKey } from '../../../api/candidate-lifecycle.models';
import { academicInformationDefinition } from './steps/academic/academic.form';
import { applicationInformationDefinition } from './steps/application-information/application-information.form';
import { boardLicenseDefinition } from './steps/board-license/board-license.form';
import { englishProficiencyDefinition } from './steps/english/english.form';
import { entranceExamDefinition } from './steps/entrance-exam/entrance-exam.form';
import { internshipInformationDefinition } from './steps/internship/internship.form';
import { personalInformationDefinition } from './steps/personal/personal.form';
import { residencyInformationDefinition } from './steps/residency/residency.form';
import { SectionFormDefinition } from './wizard-model';

/** Every contract section with the form that edits it. */
export const SECTION_DEFINITIONS: Readonly<Record<ApplicationSectionKey, SectionFormDefinition>> = {
  'application-information': applicationInformationDefinition as unknown as SectionFormDefinition,
  'personal-information': personalInformationDefinition as unknown as SectionFormDefinition,
  'academic-information': academicInformationDefinition as unknown as SectionFormDefinition,
  'english-proficiency': englishProficiencyDefinition as unknown as SectionFormDefinition,
  'internship-information': internshipInformationDefinition as unknown as SectionFormDefinition,
  'residency-information': residencyInformationDefinition as unknown as SectionFormDefinition,
  'board-license-information': boardLicenseDefinition as unknown as SectionFormDefinition,
  'residency-entrance-exam': entranceExamDefinition as unknown as SectionFormDefinition,
};
