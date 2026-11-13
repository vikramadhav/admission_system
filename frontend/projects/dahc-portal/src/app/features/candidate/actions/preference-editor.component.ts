import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DahcRankedSelectionComponent, DahcSelectComponent, DahcSelectOption } from 'dahc-ui';

import { CatalogNamesService } from '../../../shared/catalog-names.service';

export type PreferenceGroup = FormGroup<{
  specialtyId: FormControl<string>;
  siteIds: FormControl<string[]>;
}>;

/** A specialty with its sites; choosing another specialty clears the sites of the previous one. */
export function createPreferenceGroup(specialtyId = '', siteIds: string[] = []): PreferenceGroup {
  const group: PreferenceGroup = new FormGroup({
    specialtyId: new FormControl<string>(specialtyId, { nonNullable: true }),
    siteIds: new FormControl<string[]>(siteIds, { nonNullable: true }),
  });
  group.controls.specialtyId.valueChanges.subscribe(() => group.controls.siteIds.setValue([]));

  return group;
}

/** One specialty preference with its ordered training sites (US-1.2.6, validated like US-1.3.1). */
@Component({
  selector: 'dahc-preference-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcRankedSelectionComponent, DahcSelectComponent, ReactiveFormsModule],
  styles: `
    :host { display: grid; gap: var(--dahc-space-4); }
    p { margin: 0; color: var(--dahc-color-text-secondary); }
  `,
  template: `
    <ng-container [formGroup]="group()">
      <dahc-select
        formControlName="specialtyId"
        [label]="specialtyLabel()"
        [options]="specialtyOptions()"
        [required]="required()"
        [invalid]="specialtyError() !== ''"
        [errorMessage]="specialtyError()" />
      @if (specialtyId() !== '') {
        @if (sites.isLoading()) {
          <p role="status" i18n="@@portal.preferences.loadingSites">Loading training sites…</p>
        } @else {
          <dahc-ranked-selection
            formControlName="siteIds"
            [label]="sitesLabel()"
            i18n-description="@@portal.preferences.sitesDescription"
            description="Choose one or more sites and put them in your order of preference."
            [options]="siteOptions()"
            [required]="true"
            [invalid]="sitesError() !== ''"
            [errorMessage]="sitesError()" />
        }
      }
    </ng-container>
  `,
})
export class PreferenceEditorComponent {
  private readonly names = inject(CatalogNamesService);

  readonly group = input.required<PreferenceGroup>();
  /** The group's current specialty, passed in so the site list follows it. */
  readonly specialtyId = input.required<string>();
  readonly specialtyLabel = input.required<string>();
  readonly sitesLabel = input.required<string>();
  readonly specialtyOptions = input<readonly DahcSelectOption[]>([]);
  readonly required = input<boolean>(false);
  readonly specialtyError = input<string>('');
  readonly sitesError = input<string>('');

  protected readonly sites = rxResource({
    params: () => (this.specialtyId() === '' ? undefined : this.specialtyId()),
    stream: ({ params }) => this.names.specialtySites(params),
  });

  protected readonly siteOptions = computed<readonly DahcSelectOption[]>(() =>
    this.sites.hasValue() ? this.sites.value().map(site => ({ value: site.id, label: site.name })) : [],
  );
}
