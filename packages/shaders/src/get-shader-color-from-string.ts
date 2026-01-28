/**  Convert color string from HSL, RGB, or hex to 0-to-1-range-RGBA array */
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

  let r: number,
    g: number,
    b: number,
    a = 1;
  if (colorString.startsWith('#')) {
    [r, g, b, a] = hexToRgba(colorString);
  } else if (colorString.startsWith('rgb')) {
    [r, g, b, a] = parseRgba(colorString);
  } else if (colorString.startsWith('hsl')) {
    [r, g, b, a] = hslaToRgba(parseHsla(colorString));
  } else if (colorString.startsWith('oklab')) {
    [r, g, b, a] = oklabToRgba(parseOklab(colorString));
  } else if (colorString.startsWith('oklch')) {
    [r, g, b, a] = oklchToRgba(parseOklch(colorString));
  } else if (colorString.startsWith('color(')) {
    [r, g, b, a] = parseColorFunction(colorString);
  } else {
    console.error('Unsupported color format', colorString);
    return fallbackColor;
  }

  return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
}

/** Convert hex to RGBA (0 to 1 range) */
function hexToRgba(hex: string): [number, number, number, number] {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Expand three-letter hex to six-letter
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  // Expand six-letter hex to eight-letter (add full opacity if no alpha)
  if (hex.length === 6) {
    hex = hex + 'ff';
  }

  // Parse the components
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const a = parseInt(hex.slice(6, 8), 16) / 255;

  return [r, g, b, a];
}

/** Parse RGBA string to RGBA (0 to 1 range) */
function parseRgba(rgba: string): [number, number, number, number] {
  // Match both rgb and rgba patterns
  const match = rgba.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);
  if (!match) return [0, 0, 0, 1];

  return [
    parseInt(match[1] ?? '0') / 255,
    parseInt(match[2] ?? '0') / 255,
    parseInt(match[3] ?? '0') / 255,
    match[4] === undefined ? 1 : parseFloat(match[4]),
  ];
}

/** Parse HSLA string */
function parseHsla(hsla: string): [number, number, number, number] {
  const match = hsla.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);
  if (!match) return [0, 0, 0, 1];

  return [
    parseInt(match[1] ?? '0'),
    parseInt(match[2] ?? '0'),
    parseInt(match[3] ?? '0'),
    match[4] === undefined ? 1 : parseFloat(match[4]),
  ];
}

/** Convert HSLA to RGBA (0 to 1 range) */
function hslaToRgba(hsla: [number, number, number, number]): [number, number, number, number] {
  const [h, s, l, a] = hsla;
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = lDecimal; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;
    r = hue2rgb(p, q, hDecimal + 1 / 3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1 / 3);
  }

  return [r, g, b, a];
}

export const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

const fallbackColor = [0, 0, 0, 1] as [0, 0, 0, 1];

/** Parse oklab color string */
function parseOklab(oklab: string): [number, number, number, number] {
  // oklab(L a b) or oklab(L a b / alpha)
  const match = oklab.match(/^oklab\s*\(\s*([0-9.]+%?)\s+(-?[0-9.]+)\s+(-?[0-9.]+)\s*(?:\/\s*([0-9.]+%?))?\s*\)$/i);
  if (!match) return [0, 0, 0, 1];

  const L = match[1]?.endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1] ?? '0');
  const a_val = parseFloat(match[2] ?? '0');
  const b_val = parseFloat(match[3] ?? '0');
  const alpha = match[4] 
    ? (match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4]))
    : 1;

  return [L, a_val, b_val, alpha];
}

/** Parse oklch color string */
function parseOklch(oklch: string): [number, number, number, number] {
  // oklch(L C H) or oklch(L C H / alpha)
  const match = oklch.match(/^oklch\s*\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+(?:deg|rad|grad|turn)?)\s*(?:\/\s*([0-9.]+%?))?\s*\)$/i);
  if (!match) return [0, 0, 0, 1];

  const L = match[1]?.endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1] ?? '0');
  const C = parseFloat(match[2] ?? '0');
  let H = parseFloat(match[3] ?? '0');
  
  // Convert angle units to degrees
  if (match[3]?.endsWith('rad')) {
    H = H * (180 / Math.PI);
  } else if (match[3]?.endsWith('grad')) {
    H = H * 0.9;
  } else if (match[3]?.endsWith('turn')) {
    H = H * 360;
  }
  
  const alpha = match[4] 
    ? (match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4]))
    : 1;

  return [L, C, H, alpha];
}

/** Parse color(display-p3 ...) function */
function parseColorFunction(colorStr: string): [number, number, number, number] {
  // color(display-p3 r g b) or color(display-p3 r g b / alpha)
  const match = colorStr.match(/^color\s*\(\s*display-p3\s+([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+%?)\s*(?:\/\s*([0-9.]+%?))?\s*\)$/i);
  if (!match) return [0, 0, 0, 1];

  const r = match[1]?.endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1] ?? '0');
  const g = match[2]?.endsWith('%') ? parseFloat(match[2]) / 100 : parseFloat(match[2] ?? '0');
  const b = match[3]?.endsWith('%') ? parseFloat(match[3]) / 100 : parseFloat(match[3] ?? '0');
  const alpha = match[4] 
    ? (match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4]))
    : 1;

  // Convert Display P3 to sRGB (values are already 0-1)
  const [rs, gs, bs] = displayP3ToSrgb([r, g, b]);
  return [rs, gs, bs, alpha];
}

/** Convert OkLab to sRGB */
function oklabToRgba(oklab: [number, number, number, number]): [number, number, number, number] {
  const [L, a, b, alpha] = oklab;
  
  // Convert OkLab to linear RGB
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Convert linear RGB to sRGB
  const r = linearToSrgb(lr);
  const g = linearToSrgb(lg);
  const b_val = linearToSrgb(lb);

  return [r, g, b_val, alpha];
}

/** Convert OkLCH to sRGB */
function oklchToRgba(oklch: [number, number, number, number]): [number, number, number, number] {
  const [L, C, H, alpha] = oklch;
  
  // Convert angle to radians
  const h_rad = (H * Math.PI) / 180;
  
  // Convert OkLCH to OkLab
  const a = C * Math.cos(h_rad);
  const b = C * Math.sin(h_rad);
  
  return oklabToRgba([L, a, b, alpha]);
}

/** Convert Display P3 color to sRGB */
function displayP3ToSrgb(p3: [number, number, number]): [number, number, number] {
  // Apply gamma to get linear values
  const linearP3 = p3.map(c => Math.pow(c, 2.2));
  
  // Convert linear P3 to linear sRGB using transformation matrix
  const lr = 1.2249401 * linearP3[0]! - 0.0420569 * linearP3[1]! - 0.0196376 * linearP3[2]!;
  const lg = -0.2249404 * linearP3[0]! + 1.0420571 * linearP3[1]! - 0.0786361 * linearP3[2]!;
  const lb = 0.0000000 * linearP3[0]! + 0.0000000 * linearP3[1]! + 1.0982735 * linearP3[2]!;
  
  // Convert linear sRGB to sRGB (clamp to avoid NaN from negative values)
  const r = Math.pow(Math.max(0, lr), 1.0 / 2.2);
  const g = Math.pow(Math.max(0, lg), 1.0 / 2.2);
  const b = Math.pow(Math.max(0, lb), 1.0 / 2.2);
  
  return [r, g, b];
}

/** Convert linear value to sRGB (gamma correction) */
function linearToSrgb(linear: number): number {
  return Math.pow(Math.max(0, linear), 1.0 / 2.2);
}
