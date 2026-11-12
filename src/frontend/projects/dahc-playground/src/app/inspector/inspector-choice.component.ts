import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { dahcUniqueId } from 'dahc-ui';

/** Inspector row for an input with a fixed set of values. */
@Component({
  selector: 'dahc-inspector-choice',
  template: `
    <label class="pg-inspector-label" [for]="controlId">{{ label() }}</label>
    <select class="pg-inspector-control" [id]="controlId" (change)="onChange($event)">
      @for (option of options(); track option; let index = $index) {
        <option [value]="index" [selected]="option === value()">{{ option }}</option>
      }
    </select>
  `,
  styleUrl: './inspector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectorChoiceComponent<T extends string | number> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly T[]>();
  readonly value = model.required<T>();

  protected readonly controlId = dahcUniqueId('pg-choice');

  protected onChange(event: Event): void {
    const index = Number((event.target as HTMLSelectElement).value);
    const option = this.options()[index];

    if (option !== undefined) {
      this.value.set(option);
    }
  }
}
