import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DahcDetailItem, DahcDetailListColumns, DahcDetailListComponent } from 'dahc-ui';

import { InspectorChoiceComponent } from '../inspector/inspector-choice.component';
import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { InspectorToggleComponent } from '../inspector/inspector-toggle.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-detail-list-page',
  templateUrl: './detail-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcDetailListComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class DetailListPageComponent {
  protected readonly sourceFiles = [
    'detail-list/detail-list.component.ts',
    'detail-list/detail-list.component.html',
    'detail-list/detail-list.component.scss',
  ];
  protected readonly columnOptions: readonly DahcDetailListColumns[] = [1, 2, 3];

  protected readonly columns = signal<DahcDetailListColumns>(3);
  protected readonly emptyValue = signal<string>('Not available');
  protected readonly includeEmptyItem = signal<boolean>(true);

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
