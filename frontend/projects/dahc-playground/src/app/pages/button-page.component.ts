import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DahcButtonComponent, DahcButtonSize, DahcButtonVariant } from 'dahc-ui';

import { EventLogComponent } from '../inspector/event-log.component';
import { InspectorChoiceComponent } from '../inspector/inspector-choice.component';
import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { InspectorToggleComponent } from '../inspector/inspector-toggle.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-button-page',
  templateUrl: './button-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    RouterLink,
  ],
})
export class ButtonPageComponent {
  protected readonly sourceFiles = ['button/button.component.ts', 'button/button.component.html', 'button/button.component.scss'];
  protected readonly variants: readonly DahcButtonVariant[] = ['primary', 'secondary', 'tertiary', 'danger'];
  protected readonly sizes: readonly DahcButtonSize[] = ['sm', 'md', 'lg'];

  protected readonly text = signal<string>('Save draft');
  protected readonly variant = signal<DahcButtonVariant>('primary');
  protected readonly size = signal<DahcButtonSize>('md');
  protected readonly disabled = signal<boolean>(false);
  protected readonly loading = signal<boolean>(false);
  protected readonly block = signal<boolean>(false);
  protected readonly loadingLabel = signal<string>('Please wait');
  protected readonly events = signal<readonly string[]>([]);

  protected recordClick(): void {
    this.events.update(events => [`click (${this.variant()})`, ...events]);
  }
}
