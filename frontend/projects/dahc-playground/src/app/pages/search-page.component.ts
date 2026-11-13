import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcSearchComponent, DahcSearchSize } from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-search-page',
  templateUrl: './search-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcSearchComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class SearchPageComponent {
  protected readonly sourceFiles = [
    'forms/search/search.component.ts',
    'forms/search/search.component.html',
    'forms/search/search.component.css',
  ];
  protected readonly sizes: readonly DahcSearchSize[] = ['md', 'lg'];

  protected readonly label = signal<string>('Search training sites');
  protected readonly placeholder = signal<string>('Search by hospital or area');
  protected readonly size = signal<DahcSearchSize>('md');
  protected readonly showLabel = signal<boolean>(false);
  protected readonly events = signal<readonly string[]>([]);

  protected recordSearch(query: string): void {
    this.events.update(events => [`searchSubmitted ("${query}")`, ...events]);
  }

  protected readonly whenToUse: readonly string[] = [
    'Let people find content by keyword, such as programmes, hospitals or services.',
    'Use the large size for a page-level search, and the default size inside toolbars and lists.',
    'Keep a visible or hidden label: a placeholder is not a label.',
  ];

  protected readonly exampleLastQuery = signal<string>('');
}
