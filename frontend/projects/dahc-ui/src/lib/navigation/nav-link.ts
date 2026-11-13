/**
 * A navigation target shared by breadcrumbs, header, footer and menus: an in-app route
 * (rendered with routerLink) or a plain URL (href), never both.
 */
export interface DahcNavLink {
  readonly label: string;
  /** In-app route, for example '/applications' or ['/applications', id]. */
  readonly route?: string | readonly unknown[];
  /** External or non-Angular URL. */
  readonly href?: string;
  /** Marks the current page (aria-current="page"). */
  readonly current?: boolean;
}
