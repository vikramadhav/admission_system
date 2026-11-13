/**
 * Positions a floating element (shown in the top layer with the Popover API) next to its anchor.
 * Flips to the opposite side when there is not enough room, keeps the element inside the viewport
 * and aligns to the start edge in the document direction.
 * Ported from dubai-health-ui (packages/components/src/internal/position.ts).
 */
export type DahcPlacement = 'bottom' | 'top' | 'start' | 'end';

export interface DahcPositionOptions {
  readonly placement?: DahcPlacement;
  /** Gap between anchor and floating element, in pixels. */
  readonly offset?: number;
  /** Match the anchor's width (select and combobox lists). */
  readonly matchWidth?: boolean;
  /** Centre on the anchor instead of aligning to its start edge (tooltips). */
  readonly center?: boolean;
}

/** Distance kept from the viewport edges, in pixels. */
const VIEWPORT_MARGIN = 8;

export function dahcPositionFloating(
  anchor: Element,
  floating: HTMLElement,
  { placement = 'bottom', offset = 4, matchWidth = false, center = false }: DahcPositionOptions = {},
): DahcPlacement {
  const view = anchor.ownerDocument.documentElement;
  const anchorBox = anchor.getBoundingClientRect();
  const viewportWidth = view.clientWidth;
  const viewportHeight = view.clientHeight;
  const isRtl = getComputedStyle(anchor).direction === 'rtl';

  floating.style.position = 'fixed';
  floating.style.margin = '0';
  floating.style.inset = 'auto';

  if (matchWidth) {
    floating.style.inlineSize = `${anchorBox.width}px`;
  }

  const floatingBox = floating.getBoundingClientRect();
  let side = placement;

  if (side === 'bottom' && anchorBox.bottom + offset + floatingBox.height > viewportHeight && anchorBox.top - offset - floatingBox.height > 0) {
    side = 'top';
  } else if (side === 'top' && anchorBox.top - offset - floatingBox.height < 0 && anchorBox.bottom + offset + floatingBox.height < viewportHeight) {
    side = 'bottom';
  }

  let top: number;
  let left: number;

  if (side === 'bottom' || side === 'top') {
    top = side === 'bottom' ? anchorBox.bottom + offset : anchorBox.top - offset - floatingBox.height;

    if (center) {
      left = anchorBox.left + anchorBox.width / 2 - floatingBox.width / 2;
    } else {
      left = isRtl ? anchorBox.right - floatingBox.width : anchorBox.left;
    }
  } else {
    const towardsRight = (side === 'end') !== isRtl;
    left = towardsRight ? anchorBox.right + offset : anchorBox.left - offset - floatingBox.width;
    top = anchorBox.top + anchorBox.height / 2 - floatingBox.height / 2;
  }

  left = Math.max(VIEWPORT_MARGIN, Math.min(left, viewportWidth - floatingBox.width - VIEWPORT_MARGIN));
  top = Math.max(VIEWPORT_MARGIN, Math.min(top, viewportHeight - floatingBox.height - VIEWPORT_MARGIN));
  floating.style.top = `${Math.round(top)}px`;
  floating.style.left = `${Math.round(left)}px`;
  floating.dataset['side'] = side;

  return side;
}

/** Re-runs update on scroll (any scroll container) and resize while active. Returns the cleanup. */
export function dahcAutoUpdate(view: Window, update: () => void): () => void {
  const handler = (): void => update();
  view.addEventListener('scroll', handler, { capture: true, passive: true });
  view.addEventListener('resize', handler, { passive: true });

  return () => {
    view.removeEventListener('scroll', handler, { capture: true });
    view.removeEventListener('resize', handler);
  };
}
