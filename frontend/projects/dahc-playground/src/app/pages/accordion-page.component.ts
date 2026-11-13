import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcAccordionComponent, DahcAccordionItemComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-accordion-page',
  templateUrl: './accordion-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcAccordionComponent, DahcAccordionItemComponent, InspectorToggleComponent, PlaygroundPageComponent],
})
export class AccordionPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Group related content under headings when people need only one or two sections at a time, such as FAQs or eligibility rules.',
    'Keep critical information, like deadlines and required actions, outside an accordion so it is never hidden.',
    'Turn on multiple when people compare sections; leave it off for long FAQs.',
    'Use Tabs when the sections are peers the user switches between, and a plain page when everything should stay visible.',
  ];

  protected readonly sourceFiles = [
    'data-display/accordion/accordion.component.ts',
    'data-display/accordion/accordion-item.component.html',
    'data-display/accordion/accordion-item.component.css',
  ];

  protected readonly multiple = signal<boolean>(false);
  protected readonly firstOpen = signal<boolean>(true);
}
