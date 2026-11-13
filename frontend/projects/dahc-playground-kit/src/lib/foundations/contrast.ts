/** WCAG 2.x contrast ratio between two opaque colours given as #rrggbb or rgb(). */
export function contrastRatio(foreground: string, background: string): number | null {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);

  if (first === null || second === null) {
    return null;
  }

  const [lighter, darker] = first > second ? [first, second] : [second, first];

  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color: string): number | null {
  const channels = parseColor(color);

  if (!channels) {
    return null;
  }

  const [red, green, blue] = channels.map(channel => {
    const value = channel / 255;

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function parseColor(color: string): [number, number, number] | null {
  const value = color.trim().toLowerCase();
  const hex = /^#([0-9a-f]{6})$/.exec(value);

  if (hex?.[1]) {
    const digits = hex[1];

    return [0, 2, 4].map(offset => parseInt(digits.slice(offset, offset + 2), 16)) as [number, number, number];
  }

  const rgb = /^rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(value);

  return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
}
