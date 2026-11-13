import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcEmptyStateComponent,
  DahcPageHeaderComponent,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTagComponent,
} from 'dahc-ui';
import { map } from 'rxjs';

import { AdminApiService } from '../../../api/admin-api.service';
import { IntegrationClient } from '../../../api/admin.models';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import { IntegrationClientDialogComponent, permissionLabel } from './integration-client-dialog.component';

interface ClientRow extends DahcTableRow {
  readonly id: string;
  readonly name: string;
  readonly idamClientId: string;
  readonly permissions: readonly string[];
  readonly isActive: boolean;
}

/**
 * Integration clients (contract listIntegrationClients, registerIntegrationClient,
 * updateIntegrationClient): systems that call the admission API, such as the payment gateway
 * adapter, and the permissions they hold. Administrator only.
 */
@Component({
  selector: 'dahc-integration-clients-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcEmptyStateComponent,
    DahcPageHeaderComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    IntegrationClientDialogComponent,
    LoadMoreComponent,
  ],
  styleUrl: '../admin-pages.scss',
  template: `
    <dahc-page-header
      i18n-heading="@@portal.admin.integrationClients.heading"
      heading="Integration clients"
      i18n-description="@@portal.admin.integrationClients.description"
      description="Register systems that call the admission API and manage their permissions."
      [focusOnLoad]="true">
      <div page-header-actions>
        <button dahc-button type="button" (click)="openRegister()" i18n="@@portal.admin.clients.registerButton">Register integration client</button>
      </div>
    </dahc-page-header>
    <div class="dahc-portal-page">
      <section class="section" aria-labelledby="clients-list">
        <h2 id="clients-list" class="section-heading" i18n="@@portal.admin.clients.listHeading">Registered clients</h2>
        @if (list.problem(); as problem) {
          <dahc-alert variant="error" [announce]="true">
            {{ problem.detail ?? problem.title }}
            <button dahc-button type="button" variant="link" (click)="list.reload()" i18n="@@portal.action.tryAgain">Try again</button>
          </dahc-alert>
        }
        @if (list.loaded() && rows().length === 0 && !list.loading()) {
          <dahc-empty-state
            [headingLevel]="3"
            i18n-heading="@@portal.admin.clients.emptyHeading"
            heading="No integration clients"
            i18n-description="@@portal.admin.clients.emptyText"
            description="Register a client before a system can call the admission API." />
        } @else {
          <dahc-table
            i18n-caption="@@portal.admin.clients.caption"
            caption="Integration clients"
            [columns]="columns"
            [rows]="rows()"
            [loading]="list.loading()"
            scrollX="760px">
            <ng-template dahcTableCell="permissions" let-row>
              <span class="tags">
                @for (permission of asRow(row).permissions; track permission) {
                  <dahc-tag purpose="informative-blue" appearance="outline">{{ permission }}</dahc-tag>
                } @empty {
                  <span i18n="@@portal.admin.none">None</span>
                }
              </span>
            </ng-template>
            <ng-template dahcTableCell="isActive" let-row>
              @if (asRow(row).isActive) {
                <dahc-tag purpose="success" i18n="@@portal.admin.status.active">Active</dahc-tag>
              } @else {
                <dahc-tag purpose="error" i18n="@@portal.admin.clients.inactive">Inactive</dahc-tag>
              }
            </ng-template>
            <ng-template dahcTableCell="actions" let-row>
              <button dahc-button type="button" variant="link" size="sm" (click)="openEdit(asRow(row).id)" [attr.aria-label]="editLabel(asRow(row).name)" i18n="@@portal.admin.clients.edit">Edit</button>
            </ng-template>
          </dahc-table>
          <dahc-load-more [shown]="rows().length" [hasMore]="list.hasMore()" [loading]="list.loading()" (loadMore)="list.loadMore()" />
        }
      </section>
    </div>
    <dahc-integration-client-dialog [(open)]="dialogOpen" [client]="editing()" (saved)="list.reload()" (staleDetected)="list.reload()" />
  `,
})
export class IntegrationClientsPageComponent {
  private readonly api = inject(AdminApiService);

  protected readonly dialogOpen = signal<boolean>(false);
  protected readonly editing = signal<IntegrationClient | null>(null);
  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'name', title: $localize`:@@portal.admin.clients.colName:Name` },
    { key: 'idamClientId', title: $localize`:@@portal.admin.clients.colIdamClientId:IDAM client id` },
    { key: 'permissions', title: $localize`:@@portal.admin.clients.colPermissions:Permissions` },
    { key: 'isActive', title: $localize`:@@portal.admin.clients.colStatus:Status` },
    { key: 'actions', title: $localize`:@@portal.admin.clients.colActions:Actions` },
  ];

  protected readonly list = new CursorList<IntegrationClient>(cursor =>
    this.api.listIntegrationClients({ cursor }).pipe(map(result => ({ items: result.data, nextCursor: result.pagination?.nextCursor ?? null }))),
  );

  protected readonly rows = computed<readonly ClientRow[]>(() =>
    this.list.items().map(client => ({
      id: client.integrationClientId,
      name: client.name,
      idamClientId: client.idamClientId,
      permissions: client.permissions.map(permission => permissionLabel(permission)),
      isActive: client.isActive,
    })),
  );

  constructor() {
    this.list.reload();
  }

  protected openRegister(): void {
    this.editing.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(id: string): void {
    this.editing.set(this.list.items().find(client => client.integrationClientId === id) ?? null);
    this.dialogOpen.set(true);
  }

  protected editLabel(name: string): string {
    return $localize`:@@portal.admin.clients.editLabel:Edit ${name}:name:`;
  }

  protected asRow(row: DahcTableRow): ClientRow {
    return row as ClientRow;
  }
}
