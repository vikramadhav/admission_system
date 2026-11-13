import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DahcRateComponent } from 'dahc-ui';

import { DocExampleComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-rate-page',
  templateUrl: './rate-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcRateComponent,
    DocExampleComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class RatePageComponent {
  protected readonly sourceFiles = [
    'forms/rate/rate.component.ts',
    'forms/rate/rate.component.html',
    'forms/rate/rate.component.css',
  ];
  protected readonly control = new FormControl<number>(3, { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly allowClear = signal<boolean>(true);
  protected readonly readonlyControl = new FormControl<number>(4, { nonNullable: true });

  protected readonly whenToUse: readonly string[] = [
    'Collect a quick satisfaction score, such as rating a visit or a service.',
    'Show an average rating read-only.',
    'Ask an open question as well when the reason matters; a star count alone does not explain a low score.',
  ];

  protected readonly exampleInterview = new FormControl<number>(0, { nonNullable: true });
  protected readonly exampleAverage = new FormControl<number>(4, { nonNullable: true });
  protected readonly exampleScore = new FormControl<number>(7, { nonNullable: true });
}
