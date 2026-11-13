import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcLinkComponent, DahcLinkSize, DahcLinkVariant, DahcSpaceComponent } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-link-page',
  templateUrl: './link-page.component.html',
  styles: `.link-surface { padding: var(--dahc-space-4); border-radius: var(--dahc-radius-md); background-color: var(--dahc-color-surface); }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcLinkComponent,
    DahcSpaceComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class LinkPageComponent {
  protected readonly whenToUse = [
    'Navigate to another page or section; for actions that change data use a button.',
    'Use navy on the page background and on coloured surfaces, blue on white.',
    'Add iconEnd chevron-right for a call to action, and say in the text when a link opens a new tab.',
    'Keep link text meaningful out of context: avoid "click here".',
  ];

  protected readonly sourceFiles = ['navigation/link/link.component.ts', 'navigation/link/link.component.html', 'navigation/link/link.component.css'];
  protected readonly variants: readonly DahcLinkVariant[] = ['blue', 'navy'];
  protected readonly sizes: readonly DahcLinkSize[] = ['lg', 'md', 'sm'];

  protected readonly text = signal<string>('Read the admission guide');
  protected readonly variant = signal<DahcLinkVariant>('blue');
  protected readonly size = signal<DahcLinkSize>('md');
  protected readonly icon = signal<boolean>(true);
  protected readonly newTab = signal<boolean>(false);
}
