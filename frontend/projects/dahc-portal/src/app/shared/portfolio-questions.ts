import { DahcSelectOption } from 'dahc-ui';

import { PortfolioSet } from './program-rules';

/**
 * Portfolio question sets from the BRD (US-1.3.10, SBRD:720-756). The contract has no
 * endpoint that returns the questions of a draft (only answers), so the portal holds the sets
 * (assumption A-07). Points are indicative; referees set the final score.
 */
export type PortfolioDetailType = 'text' | 'url' | 'date' | 'select';

export interface PortfolioDetailField {
  readonly key: string;
  readonly label: string;
  readonly type: PortfolioDetailType;
  readonly options?: readonly DahcSelectOption[];
  /** For a select with "Other": the key of the free-text field shown when Other is chosen. */
  readonly otherKey?: string;
}

export interface PortfolioEvidence {
  readonly code: string;
  readonly label: string;
}

export interface PortfolioQuestion {
  readonly id: string;
  readonly number: number;
  readonly prompt: string;
  /** Shown in the points pill, for example "5 points" or "3 to 4 points". */
  readonly pointsLabel: string;
  readonly fields: readonly PortfolioDetailField[];
  readonly evidence: readonly PortfolioEvidence[];
  readonly note?: string;
}

const OTHER_OPTION: DahcSelectOption = { value: 'OTHER', label: $localize`:@@portal.option.other:Other` };

const RESEARCH_ROLES: readonly DahcSelectOption[] = [
  { value: 'WRITING_PROPOSAL', label: $localize`:@@portal.portfolio.role.proposal:Writing a Proposal` },
  { value: 'COLLECTING_DATA', label: $localize`:@@portal.portfolio.role.collecting:Collecting Data` },
  { value: 'ANALYZING_DATA', label: $localize`:@@portal.portfolio.role.analyzing:Analyzing Data` },
  { value: 'WRITING_MANUSCRIPT', label: $localize`:@@portal.portfolio.role.manuscript:Writing a Manuscript` },
  OTHER_OPTION,
];

const PRESENTATION_TYPES: readonly DahcSelectOption[] = [
  { value: 'ORAL', label: $localize`:@@portal.portfolio.presentation.oral:Oral Presentation` },
  { value: 'POSTER', label: $localize`:@@portal.portfolio.presentation.poster:Poster Presentation` },
  { value: 'WORKSHOP', label: $localize`:@@portal.portfolio.presentation.workshop:Workshop Conduction` },
  OTHER_OPTION,
];

const AWARD_TYPES: readonly DahcSelectOption[] = [
  { value: 'DEANS_LIST', label: $localize`:@@portal.portfolio.award.deansList:Dean's List` },
  { value: 'GRADUATION_HONORS', label: $localize`:@@portal.portfolio.award.honors:Graduation Honors (Merit, Honors, Distinction)` },
  { value: 'COMPETITIVE_PRIZE', label: $localize`:@@portal.portfolio.award.prize:Competitive Prize / Top 5 rank` },
  { value: 'RESEARCH', label: $localize`:@@portal.portfolio.award.research:Research Award` },
  { value: 'PAPER', label: $localize`:@@portal.portfolio.award.paper:Paper Award` },
  { value: 'PRESENTATION', label: $localize`:@@portal.portfolio.award.presentation:Oral or Poster Presentation Award` },
];

const PUBLICATION_FIELDS: readonly PortfolioDetailField[] = [
  { key: 'researchLink', label: $localize`:@@portal.portfolio.researchLink:Research Link`, type: 'url' },
  { key: 'journal', label: $localize`:@@portal.portfolio.journal:Name of the Journal`, type: 'text' },
  { key: 'articleTitle', label: $localize`:@@portal.portfolio.articleTitle:Article Title`, type: 'text' },
  { key: 'publicationDate', label: $localize`:@@portal.portfolio.publicationDate:Date of Publication`, type: 'date' },
];

const ROLE_FIELD: PortfolioDetailField = {
  key: 'role',
  label: $localize`:@@portal.portfolio.role:Role`,
  type: 'select',
  options: RESEARCH_ROLES,
  otherKey: 'roleOther',
};

const ACTIVITY_FIELDS: readonly PortfolioDetailField[] = [
  { key: 'activityName', label: $localize`:@@portal.portfolio.activityName:Activity Name`, type: 'text' },
  { key: 'activityRole', label: $localize`:@@portal.portfolio.activityRole:Role`, type: 'text' },
  { key: 'fromDate', label: $localize`:@@portal.portfolio.fromDate:From Date`, type: 'date' },
  { key: 'toDate', label: $localize`:@@portal.portfolio.toDate:To Date`, type: 'date' },
];

const CAMPAIGN_FIELDS: readonly PortfolioDetailField[] = [
  { key: 'campaignProvider', label: $localize`:@@portal.portfolio.campaignProvider:Campaign Provider Name`, type: 'text' },
  { key: 'campaignName', label: $localize`:@@portal.portfolio.campaignName:Campaign Name`, type: 'text' },
  { key: 'campaignDate', label: $localize`:@@portal.portfolio.campaignDate:Campaign Date`, type: 'date' },
];

const MANUSCRIPT: PortfolioEvidence = { code: 'MANUSCRIPT', label: $localize`:@@portal.portfolio.manuscript:Manuscript Document` };
const CERTIFICATE: PortfolioEvidence = { code: 'CERTIFICATE', label: $localize`:@@portal.portfolio.certificate:Certificate` };
const CERTIFICATE_NOTE = $localize`:@@portal.portfolio.certificateNote:The certificate must include the date, stamp, signature, your name and role. Only one certificate.`;

function points(value: number): string {
  return value === 1
    ? $localize`:@@portal.portfolio.point:1 point`
    : $localize`:@@portal.portfolio.points:${value}:count: points`;
}

const FELLOWSHIP: readonly PortfolioQuestion[] = [
  {
    id: 'FEL-Q1',
    number: 1,
    prompt: $localize`:@@portal.portfolio.fel.q1:Were you able to publish a research article in a peer-reviewed journal?`,
    pointsLabel: points(5),
    fields: PUBLICATION_FIELDS,
    evidence: [MANUSCRIPT],
  },
  {
    id: 'FEL-Q2',
    number: 2,
    prompt: $localize`:@@portal.portfolio.fel.q2:Were you able to publish an additional peer-reviewed research article in the subspecialty program you are applying to?`,
    pointsLabel: points(5),
    fields: PUBLICATION_FIELDS,
    evidence: [MANUSCRIPT],
    note: $localize`:@@portal.portfolio.differentFromQ1:This must be a different article from question 1.`,
  },
  {
    id: 'FEL-Q3',
    number: 3,
    prompt: $localize`:@@portal.portfolio.fel.q3:Have you participated in teaching activities? (e.g. Training of Trainers courses, teaching junior residents or medical interns/students, leading teaching programs or contributing to curriculum development.)`,
    pointsLabel: points(5),
    fields: ACTIVITY_FIELDS,
    evidence: [CERTIFICATE],
    note: CERTIFICATE_NOTE,
  },
  {
    id: 'FEL-Q4',
    number: 4,
    prompt: $localize`:@@portal.portfolio.fel.q4:Have you participated in leadership activities? (e.g. serving on departmental or institutional committees related to clinical governance, quality, or patient safety, chief resident role, being an executive member of a council, or coordinating health-related educational or community events)`,
    pointsLabel: points(5),
    fields: ACTIVITY_FIELDS,
    evidence: [CERTIFICATE],
    note: CERTIFICATE_NOTE,
  },
  {
    id: 'FEL-Q5',
    number: 5,
    prompt: $localize`:@@portal.portfolio.fel.q5:Have you participated in any system-based practices? (e.g. patient safety initiative, quality improvement project, or audit)`,
    pointsLabel: points(5),
    fields: [
      { key: 'activityProvider', label: $localize`:@@portal.portfolio.activityProvider:Activity Provider Name`, type: 'text' },
      { key: 'activityName', label: $localize`:@@portal.portfolio.activityName:Activity Name`, type: 'text' },
      { key: 'activityRole', label: $localize`:@@portal.portfolio.activityRole:Role`, type: 'text' },
      { key: 'activityDate', label: $localize`:@@portal.portfolio.activityDate:Date`, type: 'date' },
    ],
    evidence: [CERTIFICATE],
    note: CERTIFICATE_NOTE,
  },
  {
    id: 'FEL-Q6',
    number: 6,
    prompt: $localize`:@@portal.portfolio.fel.q6:Do you hold additional academic qualifications, diplomas, or professional certifications beyond core medical training?`,
    pointsLabel: points(5),
    fields: [],
    evidence: [CERTIFICATE],
  },
];

type InternResidencySet = Exclude<PortfolioSet, 'fellowship'>;

/** Points per set, in the order medical internship, dental internship, residency. */
function byset(set: InternResidencySet, medical: string, dental: string, residency: string): string {
  return set === 'medical-internship' ? medical : set === 'dental-internship' ? dental : residency;
}

function internResidency(set: InternResidencySet): readonly PortfolioQuestion[] {
  const questions: PortfolioQuestion[] = [
    {
      id: 'Q1',
      number: 1,
      prompt: $localize`:@@portal.portfolio.q1:Were you able to publish a research article in a peer-reviewed journal?`,
      pointsLabel: byset(set, points(7), points(4), points(6)),
      fields: [...PUBLICATION_FIELDS, ROLE_FIELD],
      evidence: [MANUSCRIPT],
    },
    {
      id: 'Q2',
      number: 2,
      prompt: $localize`:@@portal.portfolio.q2:Have you participated in research activity (writing proposal, collecting data, analyzing data and writing a manuscript) whether published or not?`,
      pointsLabel: byset(set, points(4), points(2), points(4)),
      fields: [ROLE_FIELD],
      evidence: [
        { code: 'ETHICAL_APPROVAL', label: $localize`:@@portal.portfolio.ethicalApproval:Ethical Approval` },
        { code: 'PROPOSAL', label: $localize`:@@portal.portfolio.proposal:Proposal` },
        { code: 'SUPERVISOR_LETTER', label: $localize`:@@portal.portfolio.supervisorLetter:Letter of Supervisor` },
      ],
    },
    {
      id: 'Q3',
      number: 3,
      prompt: $localize`:@@portal.portfolio.q3:Have you presented in a scientific event (conference, symposium or workshop)?`,
      pointsLabel: $localize`:@@portal.portfolio.q3Points:3 to 4 points`,
      fields: [
        {
          key: 'presentationType',
          label: $localize`:@@portal.portfolio.presentationType:Presentation Type`,
          type: 'select',
          options: PRESENTATION_TYPES,
          otherKey: 'presentationTypeOther',
        },
      ],
      evidence: [CERTIFICATE],
      note: $localize`:@@portal.portfolio.q3Note:4 points for an oral presentation, 3 points for a poster, workshop or other.`,
    },
    {
      id: 'Q4',
      number: 4,
      prompt: $localize`:@@portal.portfolio.q4:Did you actively participate in any health related voluntary/community activities since entry to medical/dental school? (e.g. Breast cancer campaign, smoking cessation program, disease awareness day, health education media programs, humanitarian missions, etc.)`,
      pointsLabel: byset(set, points(4), points(2), points(2)),
      fields: CAMPAIGN_FIELDS,
      evidence: [CERTIFICATE],
      note: $localize`:@@portal.portfolio.campaignNote:The certificate must include the date, stamp, signature and the health campaign provider.`,
    },
    {
      id: 'Q5',
      number: 5,
      prompt: $localize`:@@portal.portfolio.q5:Did you actively participate in another health related voluntary/community activity since entry to medical/dental school?`,
      pointsLabel: byset(set, points(4), points(2), points(2)),
      fields: CAMPAIGN_FIELDS,
      evidence: [CERTIFICATE],
      note: $localize`:@@portal.portfolio.differentFromQ4:This must be a different activity from question 4.`,
    },
    {
      id: 'Q6',
      number: 6,
      prompt: $localize`:@@portal.portfolio.q6:Did you attend skill enhancement courses (such as Advanced life support, Point-of-Care Ultrasound Certificate (POCUS), Leadership, Quality etc) since entry to medical/dental school?`,
      pointsLabel: byset(set, points(4), points(2), points(2)),
      fields: [],
      evidence: [CERTIFICATE],
    },
    {
      id: 'Q7',
      number: 7,
      prompt: $localize`:@@portal.portfolio.q7:Did you attend another skill enhancement course since entry to medical/dental school?`,
      pointsLabel: byset(set, points(4), points(2), points(2)),
      fields: [],
      evidence: [CERTIFICATE],
      note: $localize`:@@portal.portfolio.differentFromQ6:This must be a different course from question 6.`,
    },
    {
      id: 'Q8',
      number: 8,
      prompt: $localize`:@@portal.portfolio.q8:Have you received any awards or honors for academic achievements since entry to medical/dental school? (e.g. Dean's list, Best paper, Best research, Best presentation etc)`,
      pointsLabel: byset(
        set,
        $localize`:@@portal.portfolio.q8PointsIntern:4 to 6 points`,
        $localize`:@@portal.portfolio.q8PointsIntern:4 to 6 points`,
        $localize`:@@portal.portfolio.q8PointsResidency:4 to 5 points`,
      ),
      fields: [
        { key: 'awardType', label: $localize`:@@portal.portfolio.awardType:Award Type`, type: 'select', options: AWARD_TYPES },
      ],
      evidence: [CERTIFICATE],
    },
  ];

  if (set === 'residency') {
    questions.push(
      {
        id: 'Q9',
        number: 9,
        prompt: $localize`:@@portal.portfolio.q9:Have you participated in any extracurricular activities since entering medical or dental school? (e.g. clinical attachments, summer placements, teaching, serving as a council member, or other related experiences)`,
        pointsLabel: points(2),
        fields: [],
        evidence: [CERTIFICATE],
      },
      {
        id: 'Q10',
        number: 10,
        prompt: $localize`:@@portal.portfolio.q10:Have you participated in another extracurricular activity since entering medical or dental school?`,
        pointsLabel: points(2),
        fields: [],
        evidence: [CERTIFICATE],
        note: $localize`:@@portal.portfolio.differentFromQ9:This must be a different activity from question 9.`,
      },
    );
  }

  return questions;
}

export function portfolioQuestions(set: PortfolioSet): readonly PortfolioQuestion[] {
  return set === 'fellowship' ? FELLOWSHIP : internResidency(set);
}
