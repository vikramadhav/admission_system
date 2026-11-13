import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { DahcThemeName, DahcThemeService } from '../../core/theme/theme.service';

/** Toggle button (aria-pressed) between the light and dark themes, through DahcThemeService. */
@Component({
  selector: 'dahc-theme-switch',
  templateUrl: './theme-switch.component.html',
  styleUrl: './theme-switch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DahcThemeSwitchComponent {
  readonly label = input<string>($localize`:@@dahcUi.themeSwitch.label:Dark theme`);
  readonly themeChange = output<DahcThemeName>();

  private readonly themeService = inject(DahcThemeService);
  protected readonly isDark = computed<boolean>(() => this.themeService.theme() === 'dark');

  protected toggle(): void {
    const next: DahcThemeName = this.isDark() ? 'light' : 'dark';
    this.themeService.setTheme(next);
    this.themeChange.emit(next);
  }
}
