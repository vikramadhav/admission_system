import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DahcButtonGroupComponent, DahcButtonGroupOption, DahcButtonGroupSize } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-button-group-page',
  templateUrl: './button-group-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonGroupComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class ButtonGroupPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Switch between two to five mutually exclusive views or filters, such as All, Individual and Corporate.',
    'Use a radio group instead for form questions with longer answers, and a select for more than five options.',
    'Bind it to a form control or use [(selected)] for a standalone filter.',
  ];

  protected readonly applicantTypes: readonly DahcButtonGroupOption[] = [
    { value: 'all', label: 'All' },
    { value: 'individual', label: 'Individual' },
    { value: 'corporate', label: 'Corporate' },
  ];
  protected readonly periods: readonly DahcButtonGroupOption[] = [
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year', disabled: true },
  ];

  protected readonly sourceFiles = [
    'actions/button-group/button-group.component.ts',
    'actions/button-group/button-group.component.html',
    'actions/button-group/button-group.component.css',
    'core/forms/form-control.ts',
  ];

  protected readonly options: readonly DahcButtonGroupOption[] = [
    { value: 'all', label: 'All' },
    { value: 'individual', label: 'Individual' },
    { value: 'corporate', label: 'Corporate' },
  ];
  protected readonly optionsWithDisabled: readonly DahcButtonGroupOption[] = [
    ...this.options,
    { value: 'government', label: 'Government', disabled: true },
  ];
  protected readonly sizes: readonly DahcButtonGroupSize[] = ['md', 'sm'];

  protected readonly label = signal<string>('Applicant type');
  protected readonly size = signal<DahcButtonGroupSize>('md');
  protected readonly hideLabel = signal<boolean>(false);

  protected readonly control = new FormControl<string>('all', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));

  protected readonly disabledControl = new FormControl<string>({ value: 'individual', disabled: true }, { nonNullable: true });
}
