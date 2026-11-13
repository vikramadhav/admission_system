import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcFileUploadComponent, DahcFileUploadValue } from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-file-upload-page',
  templateUrl: './file-upload-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcFileUploadComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class FileUploadPageComponent {
  protected readonly sourceFiles = [
    'forms/file-upload/file-upload.component.ts',
    'forms/file-upload/file-upload.component.html',
    'forms/file-upload/file-upload.component.css',
  ];

  protected readonly label = signal<string>('Passport copy');
  protected readonly hint = signal<string>('PDF, JPG or PNG, up to 2 MB.');
  protected readonly required = signal<boolean>(true);
  protected readonly showProgress = signal<boolean>(false);
  protected readonly events = signal<readonly string[]>([]);

  protected readonly control = new FormControl<DahcFileUploadValue>(null);
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => {
    const value = this.controlValue();

    return value ? `${value.name} (${value.size} bytes)` : 'null';
  });

  protected readonly existingControl = new FormControl<DahcFileUploadValue>({ name: 'Emirates-ID-front.pdf', size: 482_312, url: '#' });
  protected readonly disabledControl = new FormControl<DahcFileUploadValue>({ value: null, disabled: true });

  protected record(event: string): void {
    this.events.update(events => [event, ...events]);
  }

  protected readonly whenToUse: readonly string[] = [
    'Upload a document or image as part of a form, such as a CV or a passport copy.',
    'Always set accept and maxSize and say them in the hint, so people know what is allowed before they choose.',
    'Uploading is the app’s job: listen to fileSelected, upload, and set progress while it runs.',
  ];

  protected readonly exampleCv = new FormControl<DahcFileUploadValue>(null);
  protected readonly examplePhoto = new FormControl<DahcFileUploadValue>(null);
  protected readonly exampleDegree = new FormControl<DahcFileUploadValue>({ name: 'Degree-certificate.pdf', size: 1_204_224, url: '#' });
  protected readonly exampleClearance = new FormControl<DahcFileUploadValue>(null, Validators.required);
}
