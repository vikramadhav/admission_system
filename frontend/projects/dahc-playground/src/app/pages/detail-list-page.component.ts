import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DahcDetailItem, DahcDetailItemComponent, DahcDetailListColumns, DahcDetailListComponent, DahcTagComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-detail-list-page',
  templateUrl: './detail-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,
    DahcDetailItemComponent,
    DahcDetailListComponent,
    DahcTagComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class DetailListPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show the properties of one record, such as an application summary or a profile.',
    'Use two or three columns for short values on wide screens; one column for long values.',
    'Use Table when several records share the same fields, and List for a sequence of items.',
    'Set emptyValue so a missing value reads "Not available" instead of nothing.',
  ];
  protected readonly summaryItems: readonly DahcDetailItem[] = [
    { label: 'Program', value: 'Fellowship' },
    { label: 'Specialty', value: 'Adult Cardiology' },
    { label: 'Training site', value: 'Rashid Hospital' },
  ];
  protected readonly partialItems: readonly DahcDetailItem[] = [
    { label: 'Created', value: '1 Oct 2026' },
    { label: 'Submitted', value: '' },
  ];

  protected readonly sourceFiles = [
    'data-display/detail-list/detail-list.component.ts',
    'data-display/detail-list/detail-list.component.html',
    'data-display/detail-list/detail-list.component.css',
    'data-display/detail-list/detail-item.component.css',
  ];
  protected readonly columnOptions: readonly DahcDetailListColumns[] = [1, 2, 3];

  protected readonly columns = signal<DahcDetailListColumns>(3);
  protected readonly emptyValue = signal<string>('Not available');
  protected readonly includeEmptyItem = signal<boolean>(true);
  protected readonly heading = signal<string>('');
  protected readonly bordered = signal<boolean>(false);

  protected readonly items = computed<readonly DahcDetailItem[]>(() => {
    const items: DahcDetailItem[] = [
      { label: 'Program', value: 'Medical Residency' },
      { label: 'Created', value: '4 Sept 2026' },
      { label: 'Submission deadline', value: '30 Sept 2026, 23:59' },
    ];

    if (this.includeEmptyItem()) {
      items.push({ label: 'Submitted', value: '' });
    }

    return items;
  });

  protected readonly arabicItems: readonly DahcDetailItem[] = [
    { label: 'البرنامج', value: 'الإقامة الطبية' },
    { label: 'تاريخ الإنشاء', value: '٤ سبتمبر ٢٠٢٦' },
  ];
}
