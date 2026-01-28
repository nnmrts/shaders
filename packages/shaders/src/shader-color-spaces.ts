export const ShaderColorSpaces = {
  rgb: 0,
  oklch: 1,
  displayP3: 2,
} as const;

export type ShaderColorSpace = keyof typeof ShaderColorSpaces;

export const declareOklchTransforms = `

// magic numbers (and magic could be better tbh)
#define OKLCH_CHROMA_THRESHOLD .001
#define OKLCH_HUE_NEUTRALIZER - 2.

vec3 srgbToLinear(vec3 srgb) {
  return pow(srgb, vec3(2.2));
}

vec3 linearToSrgb(vec3 linear) {
  return pow(linear, vec3(1.0 / 2.2));
}

// Display P3 color space conversions
// Display P3 uses the same transfer function as sRGB (gamma 2.2 approximation)
vec3 displayP3ToLinear(vec3 p3) {
  return pow(p3, vec3(2.2));
}

vec3 linearToDisplayP3(vec3 linear) {
  return pow(linear, vec3(1.0 / 2.2));
}

// Convert linear sRGB to linear Display P3
vec3 linearSrgbToLinearP3(vec3 lrgb) {
  mat3 srgbToP3 = mat3(
    0.8224621, 0.0331941, 0.0170827,
    0.1775380, 0.9668058, 0.0723974,
    0.0000000, 0.0000000, 0.9105199
  );
  return srgbToP3 * lrgb;
}

// Convert linear Display P3 to linear sRGB
vec3 linearP3ToLinearSrgb(vec3 lp3) {
  mat3 p3ToSrgb = mat3(
    1.2249401, -0.0420569, -0.0196376,
    -0.2249404, 1.0420571, -0.0786361,
    0.0000000, 0.0000000, 1.0982735
  );
  return p3ToSrgb * lp3;
}

// Convert sRGB to Display P3
vec3 srgbToDisplayP3(vec3 srgb) {
  return linearToDisplayP3(linearSrgbToLinearP3(srgbToLinear(srgb)));
}

// Convert Display P3 to sRGB
vec3 displayP3ToSrgb(vec3 p3) {
  return linearToSrgb(linearP3ToLinearSrgb(displayP3ToLinear(p3)));
}

vec3 LrgbToOklab(vec3 rgb) {
  float L = pow(0.4122214708 * rgb.r + 0.5363325363 * rgb.g + 0.0514459929 * rgb.b, 1.0 / 3.0);
  float M = pow(0.2119034982 * rgb.r + 0.6806995451 * rgb.g + 0.1073969566 * rgb.b, 1.0 / 3.0);
  float S = pow(0.0883024619 * rgb.r + 0.2817188376 * rgb.g + 0.6299787005 * rgb.b, 1.0 / 3.0);
  return vec3(
    0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S,
    1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S,
    0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S
  );
}

vec3 OklabToLrgb(vec3 oklab) {
  float L = oklab.x;
  float a = oklab.y;
  float b = oklab.z;

  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.291485548 * b;

  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;

  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  );
}

vec3 oklabToOklch(vec3 oklab) {
  float C = length(oklab.yz);
  float H = atan(oklab.z, oklab.y);
  if (C < OKLCH_CHROMA_THRESHOLD) {
    H = OKLCH_HUE_NEUTRALIZER;
  }
  return vec3(oklab.x, C, H);
}

vec3 oklchToOklab(vec3 oklch) {
  float a = oklch.y * cos(oklch.z);
  float b = oklch.y * sin(oklch.z);
  return vec3(oklch.x, a, b);
}

float mixHue(float h1, float h2, float mixer) {
  float delta = mod(h2 - h1 + PI, TWO_PI) - PI;
  return h1 + mixer * delta;
}

vec3 srgbToOklab(vec3 rgb) {
  return oklabToOklch(LrgbToOklab(srgbToLinear(rgb)));
}

vec3 oklabToSrgb(vec3 oklab) {
  return linearToSrgb(OklabToLrgb(oklchToOklab(oklab)));
}

vec3 mixOklabVector(vec3 color1, vec3 color2, float mixer) {
  color1.x = mix(color1.x, color2.x, mixer);
  color1.y = mix(color1.y, color2.y, mixer);
  if (color1.y > OKLCH_CHROMA_THRESHOLD && color2.y > OKLCH_CHROMA_THRESHOLD) {
    color1.z = mixHue(color1.z, color2.z, mixer);
  }
  return color1;
}
`;
