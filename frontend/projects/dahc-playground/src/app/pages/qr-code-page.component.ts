import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcQrCodeComponent, DahcQrEcl, DahcQrIconDirective } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorTextComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-qr-code-page',
  templateUrl: './qr-code-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcQrCodeComponent, DahcQrIconDirective, InspectorChoiceComponent, InspectorTextComponent, PlaygroundPageComponent],
})
export class QrCodePageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Let people open a link or reference on their phone, for example the application reference on a printed receipt.',
    'Use error correction H when a logo sits in the centre.',
    'Always show the value as text or a link too; not everyone can scan.',
  ];

  protected readonly sourceFiles = [
    'data-display/qr-code/qr-code.component.ts',
    'data-display/qr-code/qr-code.component.css',
    'data-display/qr-code/qr-encoder.ts',
  ];

  protected readonly levels = ['L', 'M', 'Q', 'H'] as const;
  protected readonly ecl = signal<DahcQrEcl>('M');
  protected readonly value = signal<string>('https://www.dubaihealth.ae');
}
