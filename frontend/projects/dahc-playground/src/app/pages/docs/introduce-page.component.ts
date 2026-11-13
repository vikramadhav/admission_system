import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface StartLink {
  readonly route: string;
  readonly label: string;
  readonly text: string;
}

/** Docs › Introduction: what DAHC UI is, its principles and where to start. */
@Component({
  selector: 'dahc-introduce-page',
  templateUrl: './introduce-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class IntroducePageComponent {
  protected readonly startLinks: readonly StartLink[] = [
    { route: '/docs/getting-started', label: 'Getting started', text: 'add DAHC UI to an Angular application and use your first component.' },
    { route: '/docs/themes-and-languages', label: 'Themes and languages', text: 'dark theme, right-to-left and translations.' },
    { route: '/foundations/colour', label: 'Foundations', text: 'the design tokens behind every component.' },
    { route: '/components/overview', label: 'Components overview', text: 'every component, grouped by purpose, with examples and API.' },
  ];
}
