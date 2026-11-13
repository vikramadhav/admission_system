import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcCarouselComponent, DahcCarouselSlideComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-carousel-page',
  templateUrl: './carousel-page.component.html',
  styles: `
    .slide { display: grid; gap: var(--dahc-space-2); min-block-size: 10rem; padding: var(--dahc-space-8) var(--dahc-space-8) var(--dahc-space-16); color: var(--dahc-color-static-light); } .slide-heading { margin: 0; font-size: var(--dahc-type-heading-4-size); font-weight: var(--dahc-font-weight-bold); } .slide-text { margin: 0; }
    .pg-slide { display: grid; gap: var(--dahc-space-2); min-block-size: 12rem; padding: var(--dahc-space-8) var(--dahc-space-8) var(--dahc-space-16); color: var(--dahc-color-text-on-footer); }
    .pg-slide__heading { margin: 0; font-size: var(--dahc-type-heading-3-size); line-height: var(--dahc-type-heading-3-line-height); }
    .pg-slide__text { margin: 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcCarouselComponent, DahcCarouselSlideComponent, InspectorChoiceComponent, PlaygroundPageComponent],
})
export class CarouselPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show a small set (3 to 5) of related highlights in limited space, such as announcements.',
    'Do not put essential information in later slides; many people never move past the first.',
    'Prefer manual navigation; with autoplay keep long intervals (rotation stops on hover, focus and reduced motion).',
    'Give the carousel a label that says what it contains.',
  ];

  protected readonly sourceFiles = [
    'data-display/carousel/carousel.component.ts',
    'data-display/carousel/carousel.component.html',
    'data-display/carousel/carousel.component.css',
  ];

  protected readonly speeds = [0, 4000] as const;
  protected readonly autoplay = signal<number>(0);
  protected readonly index = signal<number>(0);
  protected readonly slides = [
    { heading: 'Apply for residency', text: 'Applications for the 2026-2027 cycle are open.' },
    { heading: 'Upload your documents', text: 'Prepare your passport, degree and transcripts.' },
    { heading: 'Track your status', text: 'Follow every step of your application.' },
  ];
}
