import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DahcThemeName, DahcThemeService, DahcThemeSwitchComponent } from 'dahc-ui';

import { EventLogComponent } from '../inspector/event-log.component';
import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-theme-switch-page',
  templateUrl: './theme-switch-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcThemeSwitchComponent, EventLogComponent, InspectorTextComponent, PlaygroundPageComponent],
})
export class ThemeSwitchPageComponent {
  protected readonly sourceFiles = [
    'theme-switch/theme-switch.component.ts',
    'theme-switch/theme-switch.component.html',
    'theme-switch/theme-switch.component.scss',
    'theme/theme.service.ts',
  ];

  private readonly themeService = inject(DahcThemeService);

  protected readonly label = signal<string>('Dark theme');
  protected readonly events = signal<readonly string[]>([]);
  protected readonly theme = this.themeService.theme;
  protected readonly followsSystem = this.themeService.followsSystem;

  protected onThemeChange(theme: DahcThemeName): void {
    this.events.update(events => [`themeChange: ${theme}`, ...events]);
  }

  protected followSystem(): void {
    this.themeService.followSystem();
  }
}
