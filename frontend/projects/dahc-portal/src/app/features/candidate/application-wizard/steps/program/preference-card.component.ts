import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { DahcRankedSelectionComponent, DahcSelectComponent, DahcSelectOption } from 'dahc-ui';
import { map } from 'rxjs';

import { CatalogNamesService } from '../../../../../shared/catalog-names.service';
import { fieldError } from '../../../../../shared/forms/form-errors';
import { PreferenceForm } from './program.form';

/**
 * One preference card (Figma 1:2301): the specialty and its training sites, chosen with search
 * and put in order (ranked chips). Sites follow the chosen specialty (US-1.3.1 AC4-AC10).
 */
@Component({
  selector: 'dahc-preference-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcRankedSelectionComponent, DahcSelectComponent, ReactiveFormsModule],
  styles: `
    :host { display: grid; gap: var(--dahc-space-4); padding: var(--dahc-space-5); border: var(--dahc-size-border) solid var(--dahc-color-border-subtle); border-radius: var(--dahc-radius-lg); background-color: var(--dahc-color-surface); }
    .preference-heading { margin: 0; font-size: var(--dahc-type-heading-4-size); line-height: var(--dahc-type-heading-4-line-height); font-weight: var(--dahc-type-heading-4-weight); }
    .preference-text { margin: 0; color: var(--dahc-color-text-secondary); }
  `,
  template: `
    <h3 class="preference-heading">{{ heading() }}</h3>
    <div class="preference-fields" [formGroup]="group()">
      <dahc-select
        formControlName="specialtyId"
        i18n-label="@@portal.program.specialty"
        label="Specialty"
        [options]="specialtyOptions()"
        [required]="required()"
        [invalid]="specialtyError() !== ''"
        [errorMessage]="specialtyError()" />
    </div>
    @if (specialtyId() !== '') {
      @if (sites.isLoading()) {
        <p class="preference-text" role="status" i18n="@@portal.program.loadingSites">Loading training sites…</p>
      } @else if (siteOptions().length === 0) {
        <p class="preference-text" i18n="@@portal.program.noSites">No training sites are open for this specialty.</p>
      } @else {
        <div [formGroup]="group()">
          <dahc-ranked-selection
            formControlName="siteIds"
            i18n-label="@@portal.program.sites"
            label="Training sites"
            i18n-description="@@portal.program.sitesDescription"
            description="Choose one or more sites. When you choose more than one, put them in your order of preference."
            [options]="siteOptions()"
            [required]="true"
            [invalid]="sitesError() !== ''"
            [errorMessage]="sitesError()" />
        </div>
      }
    }
  `,
})
export class PreferenceCardComponent {
  private readonly names = inject(CatalogNamesService);

  readonly group = input.required<PreferenceForm>();
  readonly heading = input.required<string>();
  /** The group's current specialty, passed in so the site list follows it. */
  readonly specialtyId = input.required<string>();
  readonly specialtyOptions = input<readonly DahcSelectOption[]>([]);
  readonly required = input<boolean>(false);
  readonly showAllErrors = input<boolean>(false);
  /** Error from a rule across both preferences, shown on this specialty. */
  readonly crossFieldError = input<string>('');

  protected readonly sites = rxResource({
    params: () => (this.specialtyId() === '' ? undefined : this.specialtyId()),
    stream: ({ params }) =>
      this.names.specialtySites(params).pipe(map(sites => sites.map(site => ({ value: site.id, label: site.name })))),
  });

  protected readonly siteOptions = computed<readonly DahcSelectOption[]>(() => (this.sites.hasValue() ? this.sites.value() : []));

  protected specialtyError(): string {
    return this.crossFieldError() || fieldError(this.group().controls.specialtyId, this.showAllErrors());
  }

  protected sitesError(): string {
    const group = this.group();

    return group.hasError('sitesRequired') && (group.controls.siteIds.touched || this.showAllErrors())
      ? $localize`:@@portal.program.sitesRequired:Select at least one training site for this specialty.`
      : '';
  }
}
