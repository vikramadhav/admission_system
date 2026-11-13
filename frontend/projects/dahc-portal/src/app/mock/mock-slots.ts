import { AttachmentSlot, SectionValues } from '../api/candidate-lifecycle.models';
import { portfolioQuestions } from '../shared/portfolio-questions';
import { ProgramRules } from '../shared/program-rules';
import { GCC_COUNTRIES } from '../shared/reference-data';
import { groupOf, valueOf } from '../shared/section-values';
import { mockProgram, mockSite, mockSpecialty } from './mock-catalog';
import { MockApplication, MockCandidate, flaggedSlotIds } from './mock-store';

const PDF = ['application/pdf'];
const IMAGE = ['image/jpeg', 'image/png'];
const TWO_MB = 2 * 1024 * 1024;

type SlotDraft = Omit<AttachmentSlot, 'attachment' | 'editable' | 'allowedMediaTypes' | 'maxFileSizeBytes'> &
  Partial<Pick<AttachmentSlot, 'allowedMediaTypes'>>;

/**
 * The attachment slots that apply to an application, as the server would generate them from
 * the program and the answers (SBRD:398-399, 443-526, 528-564, 645-689; extract §3.13). Uploaded
 * files stay attached to their slot id even while a slot is not shown.
 */
export function attachmentSlots(application: MockApplication, candidate: MockCandidate, rules: ProgramRules): AttachmentSlot[] {
  const drafts: SlotDraft[] = [];
  const add = (slot: SlotDraft): void => {
    drafts.push(slot);
  };
  const section = (key: string): SectionValues => application.sections[key as keyof MockApplication['sections']]?.values ?? {};
  const info = section('application-information');

  // Application information: CV, personal statements per site, recommendation letters, letters.
  add({ slotId: 'application-information:CV', sectionKey: 'application-information', documentTypeCode: 'CV', label: 'CV', required: true });

  for (const preference of application.preferences) {
    const specialty = mockSpecialty(preference.specialtyId)?.name ?? '';
    const ordinal = preference.preferenceOrder === 1 ? '1st preference' : '2nd preference';

    for (const site of preference.trainingSites) {
      add({
        slotId: `application-information:PERSONAL_STATEMENT:${preference.specialtyId}:${site.siteId}`,
        sectionKey: 'application-information',
        documentTypeCode: 'PERSONAL_STATEMENT',
        label: `Personal statement · ${ordinal} · ${specialty} · ${mockSite(site.siteId)?.name ?? ''}`,
        required: true,
        specialtyId: preference.specialtyId,
        trainingSiteId: site.siteId,
      });
    }

    if (rules.recommendationLetters) {
      add({
        slotId: `application-information:RECOMMENDATION_LETTER:${preference.specialtyId}`,
        sectionKey: 'application-information',
        documentTypeCode: 'RECOMMENDATION_LETTER',
        label: `Recommendation letter · ${ordinal} · ${specialty}`,
        required: true,
        specialtyId: preference.specialtyId,
      });
    }
  }

  if (rules.employmentQuestions && valueOf(info, 'currentlyEmployed') === 'YES') {
    add({ slotId: 'application-information:EMPLOYMENT_LETTER', sectionKey: 'application-information', documentTypeCode: 'EMPLOYMENT_LETTER', label: 'Employment letter', required: true });
  }

  if (rules.employmentQuestions && valueOf(info, 'registeredInMbruResidency') === 'YES') {
    add({ slotId: 'application-information:NO_OBJECTION_LETTER', sectionKey: 'application-information', documentTypeCode: 'NO_OBJECTION_LETTER', label: 'No objection letter', required: true });
  }

  // Personal information: identification documents (candidate profile).
  const identity = groupOf(candidate.profile as unknown as SectionValues, 'identity');
  const nationality = valueOf(identity, 'nationality');
  const hasEmiratesId = valueOf(identity, 'hasEmiratesId') === 'YES';
  const personal = (code: string, label: string, required: boolean, types = PDF): void =>
    add({ slotId: `personal-information:${code}`, sectionKey: 'personal-information', documentTypeCode: code, label, required, allowedMediaTypes: types });

  personal('PHOTO', 'Personal photo', true, IMAGE);
  personal('PASSPORT', 'Coloured copy of the passport', true);

  if (nationality === 'AE') {
    personal('FAMILY_BOOK', 'Coloured copy of the family book', true);
  }

  if (hasEmiratesId) {
    personal('EMIRATES_ID', 'Coloured copy of the Emirates ID (both sides)', true);
  }

  if (valueOf(identity, 'hasMarsoom') === 'YES') {
    personal('MARSOOM', 'Coloured copy of the Marsoom', true);
  }

  if (valueOf(identity, 'childOfUaeMother') === 'YES') {
    personal('MOTHER_FAMILY_BOOK', "Mother's family book", true);
    personal('BIRTH_CERTIFICATE', 'Birth certificate', true);
  }

  if (hasEmiratesId && nationality !== '' && !GCC_COUNTRIES.includes(nationality)) {
    personal('RESIDENCY_VISA', 'Coloured residency visa', true);
  }

  // University grades.
  const academic = section('academic-information');
  add({ slotId: 'academic-information:GRADUATION_CERTIFICATE', sectionKey: 'academic-information', documentTypeCode: 'GRADUATION_CERTIFICATE', label: 'Coloured copy of graduation certificate or letter of completion', required: true });
  add({ slotId: 'academic-information:TRANSCRIPT', sectionKey: 'academic-information', documentTypeCode: 'TRANSCRIPT', label: 'Coloured copy of official academic transcript (all pages)', required: true });

  if (valueOf(academic, 'country') !== '' && valueOf(academic, 'country') !== 'AE') {
    add({ slotId: 'academic-information:ECE_REPORT', sectionKey: 'academic-information', documentTypeCode: 'ECE_REPORT', label: 'ECE report', required: true });
  }

  // English proficiency.
  if (valueOf(section('english-proficiency'), 'exam') !== '') {
    add({ slotId: 'english-proficiency:ENGLISH_CERTIFICATE', sectionKey: 'english-proficiency', documentTypeCode: 'ENGLISH_CERTIFICATE', label: 'Coloured copy of the English proficiency exam certificate', required: rules.englishRequired });
  }

  if (rules.groups.includes('internship-information')) {
    add({ slotId: 'internship-information:INTERNSHIP_CERTIFICATE', sectionKey: 'internship-information', documentTypeCode: 'INTERNSHIP_CERTIFICATE', label: 'Internship certificate or enrollment letter (if current intern)', required: true });
  }

  if (rules.groups.includes('board-license-information')) {
    const boards = section('board-license-information')['boards'];
    const passed = Array.isArray(boards) && boards.some(board => valueOf(board as SectionValues, 'examResult') === 'PASS');
    add({ slotId: 'board-license-information:BOARD_CERTIFICATE', sectionKey: 'board-license-information', documentTypeCode: 'BOARD_CERTIFICATE', label: 'Board certificate or letter of completion', required: true });

    if (passed) {
      add({ slotId: 'board-license-information:WRITTEN_EXAM_PASS_LETTER', sectionKey: 'board-license-information', documentTypeCode: 'WRITTEN_EXAM_PASS_LETTER', label: 'Second written exam passing letter', required: true });
    }

    add({ slotId: 'board-license-information:TRAINING_TRANSCRIPT', sectionKey: 'board-license-information', documentTypeCode: 'TRAINING_TRANSCRIPT', label: 'Transcript from the training center or program director', required: false });
    add({ slotId: 'board-license-information:LICENSE', sectionKey: 'board-license-information', documentTypeCode: 'LICENSE', label: 'Valid specialist or consultant license', required: false });
  }

  if (rules.groups.includes('residency-entrance-exam')) {
    add({ slotId: 'residency-entrance-exam:EXAM_RESULT', sectionKey: 'residency-entrance-exam', documentTypeCode: 'EXAM_RESULT', label: 'Exam statement of result', required: true });
  }

  // Portfolio evidence: one slot per question and evidence; required only for Yes answers,
  // which the client checks before the one-time submission (no portfolio draft, OQ-C5).
  for (const question of portfolioQuestions(rules.portfolioSet)) {
    for (const evidence of question.evidence) {
      add({
        slotId: `portfolio:${question.id}:${evidence.code}`,
        sectionKey: 'portfolio',
        documentTypeCode: evidence.code,
        label: evidence.label,
        required: false,
        portfolioQuestionId: question.id,
      });
    }
  }

  const draft = application.status === 'DRAFT';
  // US-2.3.4: while corrections are open, only flagged documents can be replaced.
  const flagged = application.status === 'CORRECTION_REQUIRED' ? flaggedSlotIds(application.correction) : [];

  return drafts.map(slot => ({
    ...slot,
    allowedMediaTypes: slot.allowedMediaTypes ?? PDF,
    maxFileSizeBytes: TWO_MB,
    editable: slot.sectionKey === 'portfolio' ? draft && application.portfolio === null : draft || flagged.includes(slot.slotId),
    attachment: application.attachments[slot.slotId] ?? null,
  }));
}

export function programOf(application: MockApplication): NonNullable<ReturnType<typeof mockProgram>> {
  const program = mockProgram(application.programId);

  if (!program) {
    throw new Error(`Unknown mock program ${application.programId}`);
  }

  return program;
}
