import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcAppHeaderComponent, DahcNavLink } from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-app-header-page',
  templateUrl: './app-header-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAppHeaderComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class AppHeaderPageComponent {
  protected readonly whenToUse = [
    'Put one at the top of every page of an application, before the main content.',
    'Pass navItems for the main sections and mark the current one with current.',
    'Set languageHref and languageLabel to link to the same page in the other language.',
    'Point mainContentId at the main element so the skip link works for keyboard users.',
  ];

  protected readonly sourceFiles = [
    'navigation/app-header/app-header.component.ts',
    'navigation/app-header/app-header.component.html',
    'navigation/app-header/app-header.component.css',
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
  protected readonly showNav = signal<boolean>(true);
  protected readonly showNotifications = signal<boolean>(true);
  protected readonly navItems: readonly DahcNavLink[] = [
    { label: 'Dashboard', route: '/app-header', current: true },
    { label: 'My applications', route: '/table' },
    { label: 'Help', href: '#help' },
  ];

  protected record(event: string): void {
    this.events.update(events => [event, ...events]);
  }

  protected onSignOut(): void {
    this.events.update(events => ['signOut', ...events]);
  }
}
