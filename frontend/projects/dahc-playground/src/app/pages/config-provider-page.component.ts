import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcConfigProviderComponent, DahcPaginationComponent, DahcSpinnerComponent } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-config-provider-page',
  templateUrl: './config-provider-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcConfigProviderComponent,
    DahcPaginationComponent,
    DahcSpinnerComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class ConfigProviderPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show part of a page in another language, such as an Arabic summary on an English page.',
    'Force a direction for one area, independent of its language.',
    'Turn off animation for an area, for example in printouts or kiosk screens.',
  ];

  protected readonly sourceFiles = ['core-ported/config/config.ts'];
  protected readonly locales: readonly string[] = ['ar-AE', 'en-AE'];

  protected readonly locale = signal<string>('ar-AE');
  protected readonly reducedMotion = signal<boolean>(false);
}
