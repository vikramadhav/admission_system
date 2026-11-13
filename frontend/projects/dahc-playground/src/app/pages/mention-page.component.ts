import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DahcMentionComponent, DahcMentionOption } from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-mention-page',
  templateUrl: './mention-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcMentionComponent,
    DocExampleComponent,
    EventLogComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class MentionPageComponent {
  protected readonly sourceFiles = [
    'forms/mention/mention.component.ts',
    'forms/mention/mention.component.html',
    'forms/mention/mention.component.css',
  ];
  protected readonly control = new FormControl<string>('', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly people: readonly DahcMentionOption[] = [
    { value: 'aisha', label: 'Aisha Khan' },
    { value: 'mohamed', label: 'Mohamed Hazim' },
    { value: 'fatima', label: 'Fatima Al Suwaidi' },
    { value: 'omar', label: 'Omar Haddad' },
  ];
  protected readonly events = signal<readonly string[]>([]);

  protected onMentioned(option: DahcMentionOption): void {
    this.events.update(events => [`mentioned (${option.value})`, ...events]);
  }

  protected readonly whenToUse: readonly string[] = [
    'Mention a colleague in a note or comment so they can be notified.',
    'Change the prefix to tag other things, for example # for topics.',
    'Explain the trigger character in the hint; it is not discoverable otherwise.',
  ];

  protected readonly exampleNote = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleTopics: readonly DahcMentionOption[] = [
    { value: 'urgent', label: 'urgent' },
    { value: 'follow-up', label: 'follow-up' },
    { value: 'documents', label: 'documents' },
  ];
  protected readonly exampleTagged = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleFeedback = new FormControl<string>('', { nonNullable: true });
}
