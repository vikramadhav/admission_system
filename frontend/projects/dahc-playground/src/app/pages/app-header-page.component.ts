import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcAppHeaderComponent } from 'dahc-ui';

import { EventLogComponent } from '../inspector/event-log.component';
import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { InspectorToggleComponent } from '../inspector/inspector-toggle.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-app-header-page',
  templateUrl: './app-header-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAppHeaderComponent,
    EventLogComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class AppHeaderPageComponent {
  protected readonly sourceFiles = [
    'app-header/app-header.component.ts',
    'app-header/app-header.component.html',
    'app-header/app-header.component.scss',
  ];

  protected readonly productName = signal<string>('GME Admissions');
  protected readonly mainContentId = signal<string>('main-content');
  protected readonly skipLinkLabel = signal<string>('Skip to main content');
  protected readonly languageHref = signal<string>('/ar/dashboard');
  protected readonly languageLabel = signal<string>('العربية');
  protected readonly languageCode = signal<string>('ar');
  protected readonly userName = signal<string>('Aisha Al Mansoori');
  protected readonly signedIn = signal<boolean>(true);
  protected readonly signOutLabel = signal<string>('Sign out');
  protected readonly events = signal<readonly string[]>([]);

  protected onSignOut(): void {
    this.events.update(events => ['signOut', ...events]);
  }
}
