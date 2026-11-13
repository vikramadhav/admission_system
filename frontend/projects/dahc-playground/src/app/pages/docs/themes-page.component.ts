import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Docs › Themes and languages: dark theme, right-to-left and translating built-in texts. */
@Component({
  selector: 'dahc-themes-page',
  templateUrl: './themes-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemesPageComponent {
  protected readonly theme = `const theme = inject(DahcThemeService);
theme.setTheme('dark'); // 'light' | 'dark'; without a choice the system preference is used
// or drop in the ready-made switch: <dahc-theme-switch />`;

  protected readonly direction = `<html lang="ar-AE" dir="rtl">`;

  protected readonly i18n = `<!-- Every built-in text is an input with a translatable default -->
<dahc-pagination [total]="120" previousLabel="Previous page" nextLabel="Next page" />

// or translate the library ids (dahcUi.*) in your locale file, for example messages.ar-AE.json:
"dahcUi.pagination.previous": "..."`;
}
