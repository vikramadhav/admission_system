import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcEmptyStateComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTagComponent,
  DahcTagPurpose,
} from 'dahc-ui';
import { map } from 'rxjs';

import { ApplicationsApiService } from '../../../api/applications-api.service';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { applicationStatusDisplay } from '../../../shared/application-status';

interface ApplicationRow extends DahcTableRow {
  readonly id: string;
  readonly applicationNumber: string;
  readonly program: string;
  readonly status: string;
  readonly statusPurpose: DahcTagPurpose;
  readonly created: string;
  readonly submitted: string;
  readonly isDraft: boolean;
}

/** Every application of the candidate, newest first (US-1.2.1, US-1.2.2; breadcrumb target "My Applications"). */
@Component({
  selector: 'dahc-applications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcEmptyStateComponent,
    DahcPageHeaderComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    RouterLink,
  ],
  templateUrl: './applications-page.component.html',
  styleUrl: './applications-page.component.scss',
})
export class ApplicationsPageComponent {
  private readonly applicationsApi = inject(ApplicationsApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly breadcrumbs: readonly DahcNavLink[] = [
    { label: $localize`:@@portal.nav.home:Home`, route: '/candidate/dashboard' },
    { label: $localize`:@@portal.nav.applications:My applications` },
  ];

  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'applicationNumber', title: $localize`:@@portal.applications.number:Application ID`, sortable: true },
    { key: 'program', title: $localize`:@@portal.applications.program:Program`, sortable: true },
    { key: 'status', title: $localize`:@@portal.applications.status:Status` },
    { key: 'created', title: $localize`:@@portal.applications.created:Created` },
    { key: 'submitted', title: $localize`:@@portal.applications.submitted:Submitted` },
    { key: 'actions', title: $localize`:@@portal.applications.actions:Actions`, align: 'end' },
  ];

  protected readonly applications = rxResource({
    stream: () => this.applicationsApi.listApplications().pipe(map(result => result.data)),
  });

  protected readonly rows = computed<readonly ApplicationRow[]>(() => {
    const items = this.applications.hasValue() ? this.applications.value() : [];

    return [...items]
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
      .map(item => {
        const status = applicationStatusDisplay(item.status);

        return {
          id: item.id,
          applicationNumber: item.applicationNumber,
          program: item.program.name,
          status: status.label,
          statusPurpose: status.purpose,
          created: this.date(item.createdAt),
          submitted: this.date(item.submittedAt) || '—',
          isDraft: item.status === 'DRAFT',
        };
      });
  });

  protected asRow(row: DahcTableRow): ApplicationRow {
    return row as ApplicationRow;
  }

  private date(value: string | null | undefined): string {
    return formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), 'date');
  }
}
