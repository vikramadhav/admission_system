import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DahcButtonComponent, DahcSpaceComponent, DahcThemeName, DahcThemeService, DahcThemeSwitchComponent } from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, InspectorTextComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-theme-switch-page',
  templateUrl: './theme-switch-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcSpaceComponent,
    DahcThemeSwitchComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class ThemeSwitchPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Place one theme switch in the application header or in the user settings.',
    'Use DahcThemeService directly when the theme follows an account preference.',
    'Never use the theme to convey meaning; both themes show the same content.',
  ];

  protected setTheme(theme: DahcThemeName): void {
    this.themeService.setTheme(theme);
  }

  protected readonly sourceFiles = [
    'actions/theme-switch/theme-switch.component.ts',
    'actions/theme-switch/theme-switch.component.html',
    'actions/theme-switch/theme-switch.component.css',
    'core/theme/theme.service.ts',
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
