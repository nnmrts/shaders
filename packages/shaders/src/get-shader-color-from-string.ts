import { parse, converter } from 'culori';

/**  Convert color string from any CSS format to 0-to-1-range-RGBA array using culori */
export function getShaderColorFromString(
  colorString: string | [number, number, number] | [number, number, number, number] | undefined
): [number, number, number, number] {
  // If the color string is already an array of 3 or 4 numbers, return it (with alpha=1 if needed)
  if (Array.isArray(colorString)) {
    if (colorString.length === 4) return colorString as [number, number, number, number];
    if (colorString.length === 3) return [...colorString, 1];
    return fallbackColor;
  }

  // If the color string is not a string, return the fallback
  if (typeof colorString !== 'string') {
    return fallbackColor;
  }

  // Use culori to parse the color string - it supports all CSS color formats
  // including oklab, oklch, color(display-p3), rgb, hsl, hex, etc.
  const parsed = parse(colorString);
  
  if (!parsed) {
    console.error('Unsupported color format', colorString);
    return fallbackColor;
  }

  // Convert to RGB color space using culori's converter
  const toRgb = converter('rgb');
  const rgb = toRgb(parsed);
  
  if (!rgb) {
    console.error('Failed to convert color to RGB', colorString);
    return fallbackColor;
  }

  // Extract RGBA values (culori uses 0-1 range by default)
  const r = clamp(rgb.r ?? 0, 0, 1);
  const g = clamp(rgb.g ?? 0, 0, 1);
  const b = clamp(rgb.b ?? 0, 0, 1);
  const a = clamp(rgb.alpha ?? 1, 0, 1);

  return [r, g, b, a];
}

export const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

const fallbackColor = [0, 0, 0, 1] as [0, 0, 0, 1];
