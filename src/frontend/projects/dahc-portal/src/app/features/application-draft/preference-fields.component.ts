import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { DahcRankedSelectionComponent, DahcSelectComponent, DahcSelectOption } from 'dahc-ui';

import { CatalogApiService } from '../../api/catalog-api.service';
import { PreferenceForm } from './preference-form';

/**
 * One specialty preference: the specialty drop-down and, once a specialty is chosen, its
 * active training sites to choose and order (US-1.3.1 AC4-AC9).
 */
@Component({
  selector: 'dahc-preference-fields',
  templateUrl: './preference-fields.component.html',
  styleUrl: './preference-fields.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcRankedSelectionComponent, DahcSelectComponent, ReactiveFormsModule],
})
export class PreferenceFieldsComponent {
  readonly group = input.required<PreferenceForm>();
  /** The group's current specialty, passed in so the site list follows it. */
  readonly specialtyId = input.required<string>();
  readonly specialtyLabel = input.required<string>();
  readonly sitesLabel = input.required<string>();
  readonly specialtyOptions = input<readonly DahcSelectOption[]>([]);
  readonly required = input<boolean>(false);
  /** Shows errors for untouched fields too, after the candidate tried to continue. */
  readonly showAllErrors = input<boolean>(false);
  /** Error from a rule that spans both preferences, shown on this specialty. */
  readonly crossFieldError = input<string>('');

  private readonly catalogApi = inject(CatalogApiService);

  protected readonly sites = rxResource({
    params: () => (this.specialtyId() === '' ? undefined : this.specialtyId()),
    stream: ({ params }) => this.catalogApi.listSpecialtyTrainingSites(params),
  });

  protected readonly siteOptions = computed<readonly DahcSelectOption[]>(() =>
    this.sites.hasValue() ? this.sites.value().data.map(site => ({ value: site.id, label: site.name })) : [],
  );

  protected readonly noSitesMessage = computed<string>(() =>
    this.sites.hasValue() && this.sites.value().data.length === 0
      ? (this.sites.value().message ?? $localize`:@@portal.draft.noSites:No training sites are open for this specialty.`)
      : '',
  );

  protected specialtyError(): string {
    const control = this.group().controls.specialtyId;

    if (this.crossFieldError() !== '') {
      return this.crossFieldError();
    }

    if (control.hasError('required') && this.isShown(control.touched)) {
      return $localize`:@@portal.draft.specialtyRequired:Select a specialty.`;
    }

    return '';
  }

  protected sitesError(): string {
    const group = this.group();

    if (group.hasError('sitesRequired') && this.isShown(group.controls.siteIds.touched)) {
      return $localize`:@@portal.draft.sitesRequired:Select at least one training site for this specialty.`;
    }

    return '';
  }

  private isShown(touched: boolean): boolean {
    return touched || this.showAllErrors();
  }
}
