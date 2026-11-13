import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcAvatarComponent, DahcButtonComponent, DahcListComponent, DahcListItemComponent, DahcTagComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-list-page',
  templateUrl: './list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcAvatarComponent, DahcButtonComponent, DahcListComponent, DahcListItemComponent, DahcTagComponent, InspectorToggleComponent, PlaygroundPageComponent],
})
export class ListPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show a sequence of similar items with a title, a short description and optional actions, such as documents or referees.',
    'Use dividers or the bordered frame when items carry actions, so each row reads as one unit.',
    'Use Table when items share many fields to compare, and Detail list for the properties of one item.',
    'Give actions specific names ("Remove passport copy"), not just "Remove".',
  ];

  protected readonly sourceFiles = [
    'data-display/list/list.component.ts',
    'data-display/list/list-item.component.html',
    'data-display/list/list-item.component.css',
  ];

  protected readonly divided = signal<boolean>(true);
  protected readonly bordered = signal<boolean>(false);
}
