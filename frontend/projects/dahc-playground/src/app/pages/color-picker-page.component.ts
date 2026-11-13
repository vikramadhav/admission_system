import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcColorPickerComponent } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-color-picker-page',
  templateUrl: './color-picker-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcColorPickerComponent,
    DocExampleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class ColorPickerPageComponent {
  protected readonly sourceFiles = [
    'forms/color-picker/color-picker.component.ts',
    'forms/color-picker/color-picker.component.html',
    'forms/color-picker/color-picker.component.css',
  ];
  protected readonly control = new FormControl<string>('#002f70', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly customPresets: readonly string[] = ['#d6eefe', '#fef1db', 'green', 'red'];

  protected readonly whenToUse: readonly string[] = [
    'Let administrators choose a colour, such as a category or tag colour.',
    'Offer the brand palette as presets so most choices stay on brand.',
    'Never rely on colour alone to convey meaning in what people create with it; pair it with a label.',
  ];

  protected readonly exampleTag = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleBanner = new FormControl<string>('#d6eefe', { nonNullable: true });
  protected readonly exampleBannerPresets: readonly string[] = ['#d6eefe', '#fef1db', '#ffe9e8', '#e5ebf0'];
  protected readonly exampleTheme = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
}
