import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { dahcUniqueId } from 'dahc-ui';

/** Inspector row for a text input. */
@Component({
  selector: 'dahc-inspector-text',
  template: `
    <label class="pg-inspector-label" [for]="controlId">{{ label() }}</label>
    <input class="pg-inspector-control" type="text" [id]="controlId" [value]="value()" (input)="onInput($event)" />
  `,
  styleUrl: './inspector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectorTextComponent {
  readonly label = input.required<string>();
  readonly value = model.required<string>();

  protected readonly controlId = dahcUniqueId('pg-text');

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
