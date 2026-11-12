import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcAlertComponent, DahcAlertVariant } from 'dahc-ui';

import { EventLogComponent } from '../inspector/event-log.component';
import { InspectorChoiceComponent } from '../inspector/inspector-choice.component';
import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { InspectorToggleComponent } from '../inspector/inspector-toggle.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-alert-page',
  templateUrl: './alert-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class AlertPageComponent {
  protected readonly sourceFiles = ['alert/alert.component.ts', 'alert/alert.component.html', 'alert/alert.component.scss'];
  protected readonly variants: readonly DahcAlertVariant[] = ['info', 'success', 'warning', 'error'];

  protected readonly variant = signal<DahcAlertVariant>('error');
  protected readonly heading = signal<string>('Your draft could not be saved');
  protected readonly body = signal<string>('Please try again. Reference for support: 4bf92f3577b34da6a3ce929d0e0e4736');
  protected readonly announce = signal<boolean>(false);
  protected readonly dismissible = signal<boolean>(true);
  protected readonly dismissLabel = signal<string>('Dismiss message');
  protected readonly visible = signal<boolean>(true);
  protected readonly events = signal<readonly string[]>([]);

  protected onDismissed(): void {
    this.visible.set(false);
    this.events.update(events => ['dismissed', ...events]);
  }

  protected show(): void {
    this.visible.set(true);
  }
}
