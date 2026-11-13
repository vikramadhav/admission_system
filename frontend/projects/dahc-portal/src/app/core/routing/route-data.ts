import { Data } from '@angular/router';

/**
 * Typed data of a portal route. Titles stay in the route's `title` ($localize ids
 * `@@portal.title.<area>.<page>`); permissions are enforced with permissionGuard.
 */
export interface DahcRouteData {
  /** Text of the page in the breadcrumb trail. */
  readonly breadcrumb?: string;
  /** BRD stories the page implements, for traceability (docs/portal/00-architecture.md §5). */
  readonly stories?: readonly string[];
}

/** Route data with the portal's typed fields plus page inputs bound by withComponentInputBinding. */
export function routeData<T extends object>(data: DahcRouteData & T): Data {
  return data;
}
