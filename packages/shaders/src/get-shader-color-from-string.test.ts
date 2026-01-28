import { expect, test, describe } from 'bun:test';
import { getShaderColorFromString } from './get-shader-color-from-string.js';

describe('getShaderColorFromString', () => {
  // Test array inputs
  test('handles 3-number array input', () => {
    expect(getShaderColorFromString([0.5, 0.2, 0.7])).toEqual([0.5, 0.2, 0.7, 1]);
  });

  test('handles 4-number array input', () => {
    expect(getShaderColorFromString([0.5, 0.2, 0.7, 0.8])).toEqual([0.5, 0.2, 0.7, 0.8]);
  });

  // Test hex inputs
  test('handles 3-digit hex', () => {
    expect(getShaderColorFromString('#f00')).toEqual([1, 0, 0, 1]);
  });

  test('handles 6-digit hex', () => {
    expect(getShaderColorFromString('#ff0000')).toEqual([1, 0, 0, 1]);
  });

  test('handles 8-digit hex with alpha', () => {
    expect(getShaderColorFromString('#ff0000cc')).toEqual([1, 0, 0, 0.8]);
  });

  // Test RGB inputs
  test('handles rgb() format', () => {
    expect(getShaderColorFromString('rgb(255, 0, 0)')).toEqual([1, 0, 0, 1]);
  });

  test('handles rgba() format', () => {
    expect(getShaderColorFromString('rgba(255, 0, 0, 0.5)')).toEqual([1, 0, 0, 0.5]);
  });

  test('handles spaces in rgb format', () => {
    expect(getShaderColorFromString('rgb( 255 , 0 , 0 )')).toEqual([1, 0, 0, 1]);
  });

  // Test HSL inputs
  test('handles hsl() format', () => {
    expect(getShaderColorFromString('hsl(0, 100%, 50%)')).toEqual([1, 0, 0, 1]);
  });

  test('handles hsla() format', () => {
    expect(getShaderColorFromString('hsla(0, 100%, 50%, 0.5)')).toEqual([1, 0, 0, 0.5]);
  });

  // Test edge cases
  test('handles undefined input', () => {
    expect(getShaderColorFromString(undefined)).toEqual([0, 0, 0, 1]);
  });

  test('handles invalid color string', () => {
    expect(getShaderColorFromString('not-a-color')).toEqual([0, 0, 0, 1]);
  });

  // Test color value ranges
  test('normalizes RGB values to 0-1 range', () => {
    expect(getShaderColorFromString('rgb(127, 127, 127)')).toEqual([
      0.4980392156862745, 0.4980392156862745, 0.4980392156862745, 1,
    ]);
  });

  test('clamps alpha values to 0-1 range', () => {
    expect(getShaderColorFromString('rgba(273, 800, 8000, 1.5)')).toEqual([1, 1, 1, 1]);
    // Note negative values aren't valid and we just let them be undefined behavior
  });

  // Test OkLab color format
  describe('oklab color format', () => {
    test('handles oklab() format', () => {
      const result = getShaderColorFromString('oklab(0.5 0.1 -0.1)');
      expect(result[3]).toBe(1); // alpha should be 1
      expect(result[0]).toBeGreaterThanOrEqual(0);
      expect(result[0]).toBeLessThanOrEqual(1);
    });

    test('handles oklab() with alpha', () => {
      const result = getShaderColorFromString('oklab(0.5 0.1 -0.1 / 0.5)');
      expect(result[3]).toBe(0.5);
    });

    test('handles oklab() with percentage alpha', () => {
      const result = getShaderColorFromString('oklab(0.5 0.1 -0.1 / 50%)');
      expect(result[3]).toBe(0.5);
    });

    test('handles oklab() with percentage lightness', () => {
      const result = getShaderColorFromString('oklab(50% 0.1 -0.1)');
      expect(result[3]).toBe(1);
    });

    test('converts oklab red to correct RGB values', () => {
      // oklab(0.628 0.225 0.126) is approximately pure red
      const result = getShaderColorFromString('oklab(0.628 0.225 0.126)');
      expect(result[0]).toBeCloseTo(1, 1); // R
      expect(result[1]).toBeCloseTo(0, 1); // G
      expect(result[2]).toBeCloseTo(0, 1); // B
      expect(result[3]).toBe(1); // A
    });
  });

  // Test OkLCH color format
  describe('oklch color format', () => {
    test('handles oklch() format', () => {
      const result = getShaderColorFromString('oklch(0.5 0.1 180)');
      expect(result[3]).toBe(1); // alpha should be 1
      expect(result[0]).toBeGreaterThanOrEqual(0);
      expect(result[0]).toBeLessThanOrEqual(1);
    });

    test('handles oklch() with alpha', () => {
      const result = getShaderColorFromString('oklch(0.5 0.1 180 / 0.75)');
      expect(result[3]).toBe(0.75);
    });

    test('handles oklch() with deg unit', () => {
      const result = getShaderColorFromString('oklch(0.5 0.1 180deg)');
      expect(result[3]).toBe(1);
    });

    test('handles oklch() with rad unit', () => {
      const result = getShaderColorFromString('oklch(0.5 0.1 3.14159rad)');
      expect(result[3]).toBe(1);
    });

    test('handles oklch() with turn unit', () => {
      const result = getShaderColorFromString('oklch(0.5 0.1 0.5turn)');
      expect(result[3]).toBe(1);
    });

    test('converts oklch red to correct RGB values', () => {
      // oklch(0.628 0.257 29.2) is approximately pure red
      const result = getShaderColorFromString('oklch(0.628 0.257 29.2)');
      expect(result[0]).toBeCloseTo(1, 1); // R
      expect(result[1]).toBeCloseTo(0, 1); // G
      expect(result[2]).toBeCloseTo(0, 1); // B
      expect(result[3]).toBe(1); // A
    });
  });

  // Test Display P3 color format
  describe('color(display-p3) format', () => {
    test('handles color(display-p3) format', () => {
      const result = getShaderColorFromString('color(display-p3 1 0 0)');
      expect(result[3]).toBe(1); // alpha should be 1
      expect(result[0]).toBeGreaterThanOrEqual(0);
      expect(result[0]).toBeLessThanOrEqual(1);
    });

    test('handles color(display-p3) with alpha', () => {
      const result = getShaderColorFromString('color(display-p3 1 0 0 / 0.8)');
      expect(result[3]).toBe(0.8);
    });

    test('handles color(display-p3) with percentage values', () => {
      const result = getShaderColorFromString('color(display-p3 100% 0% 0%)');
      expect(result[3]).toBe(1);
      expect(result[0]).toBeGreaterThanOrEqual(0);
      expect(result[0]).toBeLessThanOrEqual(1);
    });

    test('handles color(display-p3) with percentage alpha', () => {
      const result = getShaderColorFromString('color(display-p3 1 0 0 / 50%)');
      expect(result[3]).toBe(0.5);
    });

    test('converts display-p3 red to sRGB values', () => {
      // P3 pure red should convert to slightly oversaturated sRGB red
      const result = getShaderColorFromString('color(display-p3 1 0 0)');
      expect(result[0]).toBeGreaterThan(0.9); // R should be close to or exceed 1
      expect(result[1]).toBeCloseTo(0, 1); // G should be near 0
      expect(result[2]).toBeCloseTo(0, 1); // B should be near 0
      expect(result[3]).toBe(1); // A
    });
  });
});
