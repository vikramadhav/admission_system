import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { dahcUniqueId } from 'dahc-ui';

/** Inspector row for a boolean input. */
@Component({
  selector: 'dahc-inspector-toggle',
  template: `
    <span class="pg-inspector-checkbox">
      <input type="checkbox" [id]="controlId" [checked]="value()" (change)="onChange($event)" />
      <label [for]="controlId">{{ label() }}</label>
    </span>
  `,
  styleUrl: './inspector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectorToggleComponent {
  readonly label = input.required<string>();
  readonly value = model.required<boolean>();

  protected readonly controlId = dahcUniqueId('pg-toggle');

  protected onChange(event: Event): void {
    this.value.set((event.target as HTMLInputElement).checked);
  }
}
