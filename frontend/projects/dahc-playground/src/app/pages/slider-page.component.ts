import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DahcSliderComponent, DahcSliderValue } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-slider-page',
  templateUrl: './slider-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcSliderComponent, DocExampleComponent, PlaygroundPageComponent, ReactiveFormsModule],
})
export class SliderPageComponent {
  protected readonly sourceFiles = [
    'forms/slider/slider.component.ts',
    'forms/slider/slider.component.html',
    'forms/slider/slider.component.css',
  ];
  protected readonly control = new FormControl<DahcSliderValue>(40, { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly rangeControl = new FormControl<DahcSliderValue>([200, 600], { nonNullable: true });
  protected readonly rangeValue = toSignal(this.rangeControl.valueChanges, { initialValue: this.rangeControl.value });
  protected readonly rangeText = computed<string>(() => JSON.stringify(this.rangeValue()));
  protected readonly disabledControl = new FormControl<DahcSliderValue>({ value: 70, disabled: true }, { nonNullable: true });

  protected readonly whenToUse: readonly string[] = [
    'Pick an approximate value in a known range where the exact number matters less than the position, such as a distance.',
    'Use the range mode for a minimum and maximum, such as a budget.',
    'Use an input number when people need to type an exact value.',
    'Always show the unit; it is also read by screen readers in aria-valuetext.',
  ];

  protected readonly exampleDistance = new FormControl<DahcSliderValue>(15, { nonNullable: true });
  protected readonly exampleSalary = new FormControl<DahcSliderValue>([15000, 30000], { nonNullable: true });
  protected readonly exampleExperience = new FormControl<DahcSliderValue>(5, { nonNullable: true });
  protected readonly exampleLocked = new FormControl<DahcSliderValue>({ value: 30, disabled: true }, { nonNullable: true });
}
