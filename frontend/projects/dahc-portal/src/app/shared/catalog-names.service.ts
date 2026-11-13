import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, shareReplay } from 'rxjs';

import { Preference } from '../api/application.models';
import { CatalogApiService } from '../api/catalog-api.service';
import { Specialty, TrainingSite } from '../api/catalog.models';

export interface PreferenceView {
  readonly order: number;
  readonly specialtyId: string;
  readonly specialtyName: string;
  readonly sites: readonly { readonly id: string; readonly name: string }[];
}

/**
 * Names for the specialty and site ids in applications. The read models carry ids only
 * (OQ-26), so names come from the catalog; each list is fetched once per page load.
 */
@Injectable({ providedIn: 'root' })
export class CatalogNamesService {
  private readonly catalog = inject(CatalogApiService);
  private readonly specialties = new Map<string, Observable<readonly Specialty[]>>();
  private readonly sites = new Map<string, Observable<readonly TrainingSite[]>>();

  programSpecialties(programId: string): Observable<readonly Specialty[]> {
    let request = this.specialties.get(programId);

    if (!request) {
      request = this.catalog.listProgramSpecialties(programId).pipe(
        map(result => result.data),
        shareReplay(1),
      );
      this.specialties.set(programId, request);
    }

    return request;
  }

  specialtySites(specialtyId: string): Observable<readonly TrainingSite[]> {
    let request = this.sites.get(specialtyId);

    if (!request) {
      request = this.catalog.listSpecialtyTrainingSites(specialtyId).pipe(
        map(result => result.data),
        shareReplay(1),
      );
      this.sites.set(specialtyId, request);
    }

    return request;
  }

  /** Preferences of an application with names, in preference and site order. */
  preferences(programId: string, preferences: readonly Preference[] | undefined): Observable<readonly PreferenceView[]> {
    const ordered = [...(preferences ?? [])].sort((first, second) => first.preferenceOrder - second.preferenceOrder);

    if (ordered.length === 0) {
      return of([]);
    }

    return forkJoin([this.programSpecialties(programId), ...ordered.map(preference => this.specialtySites(preference.specialtyId))]).pipe(
      map(([specialties, ...siteLists]) =>
        ordered.map((preference, index) => {
          const sites = siteLists[index] ?? [];

          return {
            order: preference.preferenceOrder,
            specialtyId: preference.specialtyId,
            specialtyName: specialties.find(item => item.id === preference.specialtyId)?.name ?? preference.specialtyId,
            sites: [...preference.trainingSites]
              .sort((first, second) => first.siteOrder - second.siteOrder)
              .map(site => ({ id: site.siteId, name: sites.find(item => item.id === site.siteId)?.name ?? site.siteId })),
          };
        }),
      ),
    );
  }
}
