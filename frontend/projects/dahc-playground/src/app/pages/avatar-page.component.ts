import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcAvatarComponent, DahcAvatarSize } from 'dahc-ui';

import { DocExampleComponent, InspectorChoiceComponent, InspectorTextComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-avatar-page',
  templateUrl: './avatar-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocExampleComponent,DahcAvatarComponent, InspectorChoiceComponent, InspectorTextComponent, PlaygroundPageComponent],
})
export class AvatarPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Represent a person next to their name, in lists, comments and the header.',
    'Use a photo when you have one; initials from the name are the fallback.',
    'The avatar is named after the person; inside a row that already shows the name it adds no extra meaning.',
  ];

  protected readonly sourceFiles = [
    'data-display/avatar/avatar.component.ts',
    'data-display/avatar/avatar.component.css',
  ];

  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly size = signal<DahcAvatarSize>('md');
  protected readonly name = signal<string>('Aisha Al Mansoori');
}
