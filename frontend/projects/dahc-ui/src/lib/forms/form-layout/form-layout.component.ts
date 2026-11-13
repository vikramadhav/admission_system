import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

export type DahcFormLayoutColumns = 1 | 2;

/**
 * Lays out form fields as in the DH form pattern: one column, or two from 48rem (768px) on wider
 * screens, 24px apart. Validation and submission stay with Angular forms; this component only
 * arranges its content. Children with the class dahc-form-layout__full (or the attribute
 * dahcFormFull) span both columns.
 *
 *   <form [formGroup]="form"><dahc-form-layout [columns]="2">…fields…</dahc-form-layout></form>
 *
 * PARTIAL Figma: DH Form pattern frames (two-column fields). Ported from dubai-health-ui dh-form
 * (form/dh-form-controls.ts); its submit handling is replaced by Reactive Forms.
 */
@Component({
  selector: 'dahc-form-layout',
  template: '<ng-content />',
  styleUrl: './form-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Unencapsulated: the rules place the projected fields, so every selector starts with the element name.
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.dahc-form-layout--two]': 'columns() === 2',
  },
})
export class DahcFormLayoutComponent {
  readonly columns = input<DahcFormLayoutColumns>(1);
}
