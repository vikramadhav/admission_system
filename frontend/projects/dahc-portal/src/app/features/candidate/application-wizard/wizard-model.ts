import { FormGroup } from '@angular/forms';

import { Preference } from '../../../api/application.models';
import { ApplicationSectionKey, SectionFieldState, SectionValues } from '../../../api/candidate-lifecycle.models';
import { ProgramRules } from '../../../shared/program-rules';

/** What a section form may read about the rest of the application when it applies its rules. */
export interface WizardContext {
  readonly rules: ProgramRules;
  readonly preferences: readonly Preference[];
  /** Current (unsaved included) values of another section. */
  sectionValues(key: ApplicationSectionKey): SectionValues;
}

/**
 * How one contract section is edited: its typed Reactive Form, how saved values are loaded into
 * it, the conditional rules (re-run on every change) and the values sent on save. Each step folder
 * exports one definition; section-registry.ts collects them for the wizard state.
 */
export interface SectionFormDefinition<F extends FormGroup = FormGroup> {
  readonly key: ApplicationSectionKey;
  create(): F;
  /** Loads saved values; fields the server marks read-only are disabled by the wizard afterwards. */
  patch(form: F, values: SectionValues, fields: readonly SectionFieldState[]): void;
  /** Applies conditional requiredness (requireWhen) for the current answers and program. */
  sync(form: F, context: WizardContext): void;
  /** Values to save (getRawValue, so read-only values are kept). */
  values(form: F): SectionValues;
}

/** The primary button of the action bar when a step needs its own (for example Pay & Submit). */
export interface WizardPrimaryAction {
  readonly label: string;
  readonly loading: boolean;
  readonly disabled: boolean;
  run(): void;
}

/**
 * create: choosing the program; edit: a draft (auto-saved); view: read-only; correction: a returned
 * application where only the flagged items are open and nothing is auto-saved (US-2.3.4).
 */
export type WizardMode = 'create' | 'edit' | 'view' | 'correction';
