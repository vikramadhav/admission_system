import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SectionAttachmentsComponent } from '../../section-attachments.component';
import { WizardStateService } from '../../wizard-state.service';

/**
 * Personal information › Identification attachments (Figma 1:3604). The server decides which
 * documents apply from the identity answers (family book, Emirates ID, Marsoom, visa, …).
 */
@Component({
  selector: 'dahc-personal-attachments-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../step.scss',
  imports: [SectionAttachmentsComponent],
  template: `
    <div class="step">
      <h3 class="step-subheading" i18n="@@portal.personal.attachmentsHeading">Identification Attachments</h3>
      <p class="step-note" i18n="@@portal.personal.attachmentsNote">
        Upload clear coloured copies. The personal photo can be JPG or PNG; all other documents must be PDF. Each file can be up to 2 MB.
        The documents asked for here follow your answers in Identity.
      </p>
      <dahc-section-attachments sectionKey="personal-information" [showRequired]="state.showsAllErrors('personal-attachments')" />
    </div>
  `,
})
export class PersonalAttachmentsStepComponent {
  protected readonly state = inject(WizardStateService);
}
