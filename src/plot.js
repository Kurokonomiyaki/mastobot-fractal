import * as D3Color from 'd3-color';
import * as D3Interpolate from 'd3-interpolate';
import { randomComplex, BI_UNIT_DOMAIN, IdentityFunc, mapDomainToPixel, clamp, clampInt } from './utils';

export const plotAttractor = (output, width, height, f, color, initialPointPicker = randomComplex, finalTransform = IdentityFunc, nbIterations = 1000000, domain = BI_UNIT_DOMAIN, resetIfOverflow = false) => {
  plotFlame(output, width, height, [ f ], () => 0, [ color ], initialPointPicker, finalTransform, 1, nbIterations, domain, resetIfOverflow);
};

export const plotAttractorWithColorStealing = (output, width, height, f, colorFunc, preFinalColor = false, initialPointPicker = randomComplex, finalTransform = IdentityFunc, nbIterations = 1000000, domain = BI_UNIT_DOMAIN, resetIfOverflow = false) => {
  plotFlameWithColorStealing(output, width, height, [ f ], () => 0, colorFunc, preFinalColor, initialPointPicker, finalTransform, 1, nbIterations, domain, resetIfOverflow);
};

export const estimateAttractorDomain = (f, initialPointPicker = randomComplex, finalTransform = IdentityFunc, nbIterations = 10000) => {
  return estimateFlameDomain([ f ], () => 0, initialPointPicker, finalTransform, nbIterations);
};

export const plotFlame = (output, width, height, transforms, randomInt, colors, initialPointPicker = randomComplex, finalTransform = IdentityFunc, nbPoints = 1000, nbIterations = 10000, domain = BI_UNIT_DOMAIN, resetIfOverflow = false) => {
  for (let i = 0; i < nbPoints; i++) {
    let z = initialPointPicker();
    let pixelColor = [ 0, 0, 0 ];
    for (let j = 0; j < nbIterations; j++) {
      const selected = randomInt();
      const transform = transforms[selected];
      const color = colors[selected];

      z = transform(z);
      const fz = finalTransform(z);

      const [ fx, fy ] = mapDomainToPixel(fz.re, fz.im, domain, width, height);
      if (fx < 0 || fy < 0 || fx >= width || fy >= height) {
        if (resetIfOverflow) {
          z = initialPointPicker();
        }
        continue;
      }

      pixelColor = [
        (color[0] + pixelColor[0]) * 0.5,
        (color[1] + pixelColor[1]) * 0.5,
        (color[2] + pixelColor[2]) * 0.5,
      ];

      const idx = (fx + fy * width) * 4;
      output[idx + 0] += pixelColor[0];
      output[idx + 1] += pixelColor[1];
      output[idx + 2] += pixelColor[2];
      output[idx + 3] += 1;
    }
  }
};

export const plotFlameWithColorStealing = (output, width, height, transforms, randomInt, colorFunc, preFinalColor = false, initialPointPicker = randomComplex, finalTransform = IdentityFunc, nbPoints = 1000, nbIterations = 10000, domain = BI_UNIT_DOMAIN, resetIfOverflow = false) => {
  for (let i = 0; i < nbPoints; i++) {
    let z = initialPointPicker();
    let pixelColor = [ 0, 0, 0 ];
    for (let j = 0; j < nbIterations; j++) {
      const selected = randomInt();
      const transform = transforms[selected];

      z = transform(z);
      const fz = finalTransform(z);

      const [ fx, fy ] = mapDomainToPixel(fz.re, fz.im, domain, width, height);
      if (fx < 0 || fy < 0 || fx >= width || fy >= height) {
        if (resetIfOverflow) {
          z = initialPointPicker();
        }
        continue;
      }

      let color = null;
      if (preFinalColor) {
        color = colorFunc(z.re, z.im, i, j);
      } else {
        color = colorFunc(fz.re, fz.im, i, j);
      }

      pixelColor = [
        (color[0] + pixelColor[0]) * 0.5,
        (color[1] + pixelColor[1]) * 0.5,
        (color[2] + pixelColor[2]) * 0.5,
      ];

      const idx = (fx + fy * width) * 4;
      output[idx + 0] += pixelColor[0];
      output[idx + 1] += pixelColor[1];
      output[idx + 2] += pixelColor[2];
      output[idx + 3] += 1;
    }
  }
};

export const estimateFlameDomain = (transforms, randomInt, initialPointPicker = randomComplex, finalTransform = IdentityFunc, nbIterations = 10000) => {
  let xmin = Number.MAX_SAFE_INTEGER;
  let xmax = Number.MIN_SAFE_INTEGER;
  let ymin = Number.MAX_SAFE_INTEGER;
  let ymax = Number.MIN_SAFE_INTEGER;

  let z = initialPointPicker();
  for (let i = 0; i < nbIterations; i++) {
    const transform = transforms[randomInt()];

    z = transform(z);
    const fz = finalTransform(z);

    if (fz.re < xmin) {
      xmin = fz.re;
    } else if (fz.re > xmax) {
      xmax = fz.re;
    }
    if (fz.im < ymin) {
      ymin = fz.im;
    } else if (fz.im > ymax) {
      ymax = fz.im;
    }
  }
  return { xmin, xmax, ymin, ymax };
};


export const enforceRGBA = (buffer) => {
  let newBuffer = new Uint8Array(buffer.length);
  buffer.forEach((x, i) => {
    if ((i+1) % 4 === 0) {
      newBuffer[i] = 255;
    } else {
      newBuffer[i] = clampInt(x * 255, 0, 255);
    }
  });
  return newBuffer;
};


const DISPLAY_LUMINANCE_MAX = 200;
const SCALEFACTOR_NUMERATOR = 1.219 + Math.pow(DISPLAY_LUMINANCE_MAX * 0.25, 0.4);
export const applyContrastBasedScalefactor = (buffer, width, height, luminanceMean = 1, gamma = 0.45) => {
  // log-average luminance, as described in 'Photographic Tone Reproduction for Digital Images'
  // http://www.cmap.polytechnique.fr/~peyre/cours/x2005signal/hdr_photographic.pdf
  let logSum = 0;
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const idx = (i + j * width) * 4;
      const luminance = getLuminance(buffer[idx], buffer[idx + 1], buffer[idx + 2]) / luminanceMean;
      logSum += Math.log(Math.max(luminance, 0.0001));
    }
  }

  const logAverage = Math.pow(10, (logSum / (width * height)));

  // scale factor, as described in 'A Contrast-Based Scalefactor for Luminance Display'
  // http://gaia.lbl.gov/btech/papers/35252.pdf
  const scalefactor = Math.pow(SCALEFACTOR_NUMERATOR / (1.219 + Math.pow(logAverage, 0.4)), 2.5) / DISPLAY_LUMINANCE_MAX;
  for (let i = 0; i < buffer.length; i++) {
    if ((i + 1) % 4 !== 0) {
      buffer[i] = Math.max(buffer[i] * scalefactor / luminanceMean, 0); // apply scalefactor
    }
  }

  applyGammaCorrection(buffer, gamma);
  return buffer;
};

export const applyGammaCorrection = (buffer, gamma = 0.45) => {
  for (let i = 0; i < buffer.length; i++) {
    if ((i + 1) % 4 !== 0) {
      buffer[i] = Math.pow(buffer[i], gamma);
    }
  }
};

export const getLuminance = (r, g, b) => {
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
};


export const makeMixedColorSteal = (colors, maxDistance, maxIterations, w1 = 0.5, w2 = 0.5) => {
  let colorFunc = colors;
  if (Array.isArray(colors)) {
    colorFunc = makeColorMapFunction(buildColorMap(colors), 255);
  }
  return (re, im, p, n) => {
    const distance = Math.sqrt(re * re + im * im) / maxDistance;
    return colorFunc(w1 * distance + w2 * (n / maxIterations));
  };
};

export const buildColorMap = (colors, steps = 1024) => {
  const rgbColors = colors.map(color => D3Color.rgb(...color));
  const f = D3Interpolate.interpolateRgbBasis(rgbColors);
  const colormap = D3Interpolate.quantize(f, steps);
  return colormap.map(color => {
    const rgb = D3Color.rgb(color);
    return [ rgb.r, rgb.g, rgb.b ];
  });
};

export const normalizeColorMap = (colormap, scale = 255) => {
  return colormap.map(color => color.map(x => x / scale));
};

export const pickColorMapValue = (x, map) => {
  const i = Math.trunc(clamp(x, 0, 1) * (map.length - 1));
  return map[i];
};

export const makeColorMapFunction = (map, scale = 1) => {
  if (scale != 1) {
    map = normalizeColorMap(map, scale);
  }
  return x => pickColorMapValue(x, map);
};

export const getAnalogousPalette = (baseRgb, paletteSize, stepLength = 30) => {
  const hsl = D3Color.hsl(D3Color.rgb(...baseRgb));
  return new Array(paletteSize).fill(0).map((_, i) => {
    let offset = Math.ceil(i / 2) * stepLength;
    if (i % 2 === 1) {
      offset = -offset;
    }
    const newHue = (hsl.h + offset) % 360;
    const rgb = D3Color.hsl(newHue, hsl.s, hsl.l).rgb();
    return [ Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b) ];
  });
};
