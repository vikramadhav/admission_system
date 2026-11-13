import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  DahcButtonComponent,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTableSort,
  DahcTagComponent,
  DahcTagPurpose,
} from 'dahc-ui';

import { DocExampleComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

const STATUS_PURPOSE: Readonly<Record<string, DahcTagPurpose>> = {
  Draft: 'warning',
  Submitted: 'information',
  Shortlisted: 'success',
  Withdrawn: 'error',
};

@Component({
  selector: 'dahc-table-page',
  templateUrl: './table-page.component.html',
  styles: '.pg-subheading { margin-block: var(--dahc-space-8) var(--dahc-space-3); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcButtonComponent, DahcTableCellDirective, DahcTableComponent, DahcTagComponent, InspectorToggleComponent, PlaygroundPageComponent],
})
export class TablePageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show many records with the same fields so people can scan, compare, sort and act on them.',
    'Add pagination for long lists and selection when people act on several rows at once.',
    'For wide data use scrollX with fixed columns so identifiers and actions stay visible; give fixed columns a width.',
    'Use Detail list for the properties of one record and List for simple sequences.',
    'Always give a caption: it names the table and its scroll region.',
  ];
  protected readonly siteColumns: readonly DahcTableColumn[] = [
    { key: 'name', title: 'Site' },
    { key: 'city', title: 'City' },
    { key: 'seats', title: 'Seats', align: 'end', sortable: true },
  ];
  protected readonly siteRows: readonly DahcTableRow[] = [
    { id: 'rh', name: 'Rashid Hospital', city: 'Dubai', seats: 24 },
    { id: 'lh', name: 'Latifa Hospital', city: 'Dubai', seats: 12 },
    { id: 'dh', name: 'Dubai Hospital', city: 'Dubai', seats: 18 },
    { id: 'hh', name: 'Hatta Hospital', city: 'Hatta', seats: 4 },
  ];
  protected readonly siteSort = signal<DahcTableSort | null>({ key: 'seats', order: 'descending' });
  protected readonly siteSelection = signal<readonly string[]>(['rh']);
  protected readonly cyclePage = signal<number>(1);
  protected readonly cycleColumns: readonly DahcTableColumn[] = [
    { key: 'cycle', title: 'Cycle' },
    { key: 'applications', title: 'Applications received', align: 'end' },
  ];
  protected readonly cycleRows: readonly DahcTableRow[] = Array.from({ length: 8 }, (_, index) => ({
    id: String(2026 - index),
    cycle: `${2026 - index}-${2027 - index}`,
    applications: 900 + index * 37,
  }));
  protected readonly statusColumns: readonly DahcTableColumn[] = [
    { key: 'id', title: 'Reference' },
    { key: 'status', title: 'Status' },
  ];
  protected readonly statusRows: readonly DahcTableRow[] = [
    { id: 'GME-0301', status: 'Draft' },
    { id: 'GME-0302', status: 'Shortlisted' },
  ];
  protected readonly longColumns: readonly DahcTableColumn[] = [
    { key: 'id', title: 'Candidate ID' },
    { key: 'name', title: 'Name' },
  ];
  protected readonly longRows: readonly DahcTableRow[] = Array.from({ length: 14 }, (_, index) => ({
    id: `C-${String(index + 1).padStart(3, '0')}`,
    name: ['Aisha Khan', 'Omar Haddad', 'Fatima Rahman', 'Yousef Karim'][index % 4],
  }));

  protected readonly sourceFiles = [
    'data-display/table/table.component.ts',
    'data-display/table/table.component.html',
    'data-display/table/table.component.css',
  ];
  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'id', title: 'Application ID', sortable: true },
    { key: 'candidate', title: 'Candidate', sortable: true },
    { key: 'program', title: 'Program' },
    { key: 'score', title: 'Score', sortable: true, align: 'end' },
    { key: 'status', title: 'Status' },
  ];
  protected readonly rows: readonly DahcTableRow[] = [
    { id: 'GME-0142', candidate: 'Aisha Al Mansoori', program: 'Medical Residency', score: 87, status: 'Submitted' },
    { id: 'GME-0118', candidate: 'Omar Haddad', program: 'Internship', score: 91, status: 'Shortlisted' },
    { id: 'GME-0167', candidate: 'Fatima Rahman', program: 'Fellowship', score: null, status: 'Draft' },
    { id: 'GME-0103', candidate: 'Yousef Karim', program: 'Medical Residency', score: 78, status: 'Withdrawn' },
    { id: 'GME-0155', candidate: 'Mariam Saleh', program: 'Dental Residency', score: 84, status: 'Submitted' },
    { id: 'GME-0129', candidate: 'Khalid Nasser', program: 'Internship', score: 69, status: 'Submitted' },
    { id: 'GME-0171', candidate: 'Noura Abbas', program: 'Pharmacy Residency', score: 93, status: 'Shortlisted' },
  ];

  protected readonly selectable = signal<boolean>(true);
  protected readonly striped = signal<boolean>(false);
  protected readonly paginated = signal<boolean>(true);
  protected readonly loading = signal<boolean>(false);
  protected readonly selectedKeys = signal<readonly string[]>([]);
  protected readonly scrollY = signal<boolean>(true);
  protected readonly fixedColumns = signal<boolean>(true);
  protected readonly wideSelectedKeys = signal<readonly string[]>([]);
  protected readonly wideColumns = computed<readonly DahcTableColumn[]>(() => {
    const fixed = this.fixedColumns();

    return [
      { key: 'id', title: 'Application ID', width: '160px', ...(fixed ? { fixed: 'start' as const } : {}) },
      { key: 'candidate', title: 'Candidate', width: '200px' },
      { key: 'program', title: 'Program', width: '180px' },
      { key: 'specialty', title: 'Specialty', width: '180px' },
      { key: 'site', title: 'Training site', width: '200px', ellipsis: true },
      { key: 'nationality', title: 'Nationality', width: '140px' },
      { key: 'university', title: 'University', width: '240px', ellipsis: true },
      { key: 'gpa', title: 'GPA', width: '90px', align: 'end' },
      { key: 'score', title: 'Score', width: '90px', align: 'end' },
      { key: 'submitted', title: 'Submitted', width: '130px' },
      { key: 'status', title: 'Status', width: '140px' },
      { key: 'action', title: 'Action', width: '150px', ...(fixed ? { fixed: 'end' as const } : {}) },
    ];
  });
  protected readonly wideRows: readonly DahcTableRow[] = Array.from({ length: 30 }, (_, index) => {
    const statuses = ['Submitted', 'Shortlisted', 'Draft', 'Withdrawn'];

    return {
      id: `GME-${String(200 + index).padStart(4, '0')}`,
      candidate: ['Aisha Al Mansoori', 'Omar Haddad', 'Fatima Rahman', 'Yousef Karim', 'Mariam Saleh'][index % 5],
      program: ['Medical Residency', 'Internship', 'Fellowship'][index % 3],
      specialty: ['Internal Medicine', 'Family Medicine', 'Pediatrics', 'Emergency Medicine'][index % 4],
      site: ['Rashid Hospital and Trauma Centre', 'Latifa Women and Children Hospital', 'Dubai Hospital'][index % 3],
      nationality: ['UAE', 'Jordan', 'Egypt', 'India'][index % 4],
      university: ['Mohammed Bin Rashid University of Medicine and Health Sciences', 'University of Sharjah'][index % 2],
      gpa: (3 + (index % 10) / 10).toFixed(2),
      score: 60 + ((index * 7) % 40),
      submitted: `${String((index % 28) + 1).padStart(2, '0')}/10/2026`,
      status: statuses[index % statuses.length],
      action: '',
    };
  });
  protected readonly sort = signal<DahcTableSort | null>(null);
  protected readonly page = signal<number>(1);
  protected readonly stateText = computed<string>(
    () => `selected ${JSON.stringify(this.selectedKeys())}, sort ${JSON.stringify(this.sort())}, page ${this.page()}`,
  );

  protected purposeOf(status: unknown): DahcTagPurpose {
    return STATUS_PURPOSE[String(status)] ?? 'information';
  }
}
