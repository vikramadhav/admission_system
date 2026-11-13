import { DahcIconName } from './icon-registry.generated';

/**
 * Icons shipped with DAHC-UI: the icon sets of DH Design System REF (Icons page 50:4272), as
 * 24x24 SVG files in src/assets/icons; names come from the generated registry.
 * - Functional (frame 50:4752), unprefixed. Not shipped: "chevron small *" (distorted export; the
 *   Arrows set is used as chevron-*), Placeholder and External link (the export points the wrong way).
 * - Government (gov-*), Services (service-*), View (view-*) and Social media (social-*): from the
 *   owner's SVG exports. Social logos come once in the icon colour (the Gray style) and, where
 *   Figma has it, in brand colours (social-*-brand). The Hover and White styles are colour
 *   variations of the same shapes and are produced with CSS colour instead.
 */
export { DAHC_COLOURED_ICONS, DAHC_ICON_NAMES, DAHC_ICON_SETS } from './icon-registry.generated';
export type { DahcIconName, DahcIconSet } from './icon-registry.generated';

/** Icons that point in the reading direction and are mirrored in right-to-left layouts. */
export const DAHC_DIRECTIONAL_ICONS: ReadonlySet<DahcIconName> = new Set<DahcIconName>([
  'caret-left',
  'caret-right',
  'chevron-left',
  'chevron-right',
  'gov-arrow-left',
  'gov-arrow-right',
  'log-out',
]);
