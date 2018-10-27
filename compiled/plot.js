'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAnalogousPalette = exports.makeColorMapFunction = exports.pickColorMapValue = exports.normalizeColorMap = exports.buildColorMap = exports.makeMixedColorSteal = exports.getLuminance = exports.applyGammaCorrection = exports.applyContrastBasedScalefactor = exports.enforceRGBA = exports.estimateFlameDomain = exports.plotFlameWithColorStealing = exports.plotFlame = exports.estimateAttractorDomain = exports.plotAttractorWithColorStealing = exports.plotAttractor = undefined;

var _trunc = require('babel-runtime/core-js/math/trunc');

var _trunc2 = _interopRequireDefault(_trunc);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _minSafeInteger = require('babel-runtime/core-js/number/min-safe-integer');

var _minSafeInteger2 = _interopRequireDefault(_minSafeInteger);

var _maxSafeInteger = require('babel-runtime/core-js/number/max-safe-integer');

var _maxSafeInteger2 = _interopRequireDefault(_maxSafeInteger);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _d3Color = require('d3-color');

var D3Color = _interopRequireWildcard(_d3Color);

var _d3Interpolate = require('d3-interpolate');

var D3Interpolate = _interopRequireWildcard(_d3Interpolate);

var _utils = require('./utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var plotAttractor = exports.plotAttractor = function plotAttractor(output, width, height, f, color) {
  var initialPointPicker = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : _utils.randomComplex;
  var finalTransform = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : _utils.IdentityFunc;
  var nbIterations = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 1000000;
  var domain = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : _utils.BI_UNIT_DOMAIN;
  var resetIfOverflow = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : false;

  plotFlame(output, width, height, [f], function () {
    return 0;
  }, [color], initialPointPicker, finalTransform, 1, nbIterations, domain, resetIfOverflow);
};

var plotAttractorWithColorStealing = exports.plotAttractorWithColorStealing = function plotAttractorWithColorStealing(output, width, height, f, colorFunc) {
  var preFinalColor = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var initialPointPicker = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : _utils.randomComplex;
  var finalTransform = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : _utils.IdentityFunc;
  var nbIterations = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 1000000;
  var domain = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : _utils.BI_UNIT_DOMAIN;
  var resetIfOverflow = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : false;

  plotFlameWithColorStealing(output, width, height, [f], function () {
    return 0;
  }, colorFunc, preFinalColor, initialPointPicker, finalTransform, 1, nbIterations, domain, resetIfOverflow);
};

var estimateAttractorDomain = exports.estimateAttractorDomain = function estimateAttractorDomain(f) {
  var initialPointPicker = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _utils.randomComplex;
  var finalTransform = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _utils.IdentityFunc;
  var nbIterations = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10000;

  return estimateFlameDomain([f], function () {
    return 0;
  }, initialPointPicker, finalTransform, nbIterations);
};

var plotFlame = exports.plotFlame = function plotFlame(output, width, height, transforms, randomInt, colors) {
  var initialPointPicker = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : _utils.randomComplex;
  var finalTransform = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : _utils.IdentityFunc;
  var nbPoints = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 1000;
  var nbIterations = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 10000;
  var domain = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : _utils.BI_UNIT_DOMAIN;
  var resetIfOverflow = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : false;

  for (var i = 0; i < nbPoints; i++) {
    var z = initialPointPicker();
    var pixelColor = [0, 0, 0];
    for (var j = 0; j < nbIterations; j++) {
      var selected = randomInt();
      var transform = transforms[selected];
      var color = colors[selected];

      z = transform(z);
      var fz = finalTransform(z);

      var _mapDomainToPixel = (0, _utils.mapDomainToPixel)(fz.re, fz.im, domain, width, height),
          _mapDomainToPixel2 = (0, _slicedToArray3.default)(_mapDomainToPixel, 2),
          fx = _mapDomainToPixel2[0],
          fy = _mapDomainToPixel2[1];

      if (fx < 0 || fy < 0 || fx >= width || fy >= height) {
        if (resetIfOverflow) {
          z = initialPointPicker();
        }
        continue;
      }

      pixelColor = [(color[0] + pixelColor[0]) * 0.5, (color[1] + pixelColor[1]) * 0.5, (color[2] + pixelColor[2]) * 0.5];

      var idx = (fx + fy * width) * 4;
      output[idx + 0] += pixelColor[0];
      output[idx + 1] += pixelColor[1];
      output[idx + 2] += pixelColor[2];
      output[idx + 3] += 1;
    }
  }
};

var plotFlameWithColorStealing = exports.plotFlameWithColorStealing = function plotFlameWithColorStealing(output, width, height, transforms, randomInt, colorFunc) {
  var preFinalColor = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
  var initialPointPicker = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : _utils.randomComplex;
  var finalTransform = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : _utils.IdentityFunc;
  var nbPoints = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 1000;
  var nbIterations = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 10000;
  var domain = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : _utils.BI_UNIT_DOMAIN;
  var resetIfOverflow = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : false;

  for (var i = 0; i < nbPoints; i++) {
    var z = initialPointPicker();
    var pixelColor = [0, 0, 0];
    for (var j = 0; j < nbIterations; j++) {
      var selected = randomInt();
      var transform = transforms[selected];

      z = transform(z);
      var fz = finalTransform(z);

      var _mapDomainToPixel3 = (0, _utils.mapDomainToPixel)(fz.re, fz.im, domain, width, height),
          _mapDomainToPixel4 = (0, _slicedToArray3.default)(_mapDomainToPixel3, 2),
          fx = _mapDomainToPixel4[0],
          fy = _mapDomainToPixel4[1];

      if (fx < 0 || fy < 0 || fx >= width || fy >= height) {
        if (resetIfOverflow) {
          z = initialPointPicker();
        }
        continue;
      }

      var color = null;
      if (preFinalColor) {
        color = colorFunc(z.re, z.im, i, j);
      } else {
        color = colorFunc(fz.re, fz.im, i, j);
      }

      pixelColor = [(color[0] + pixelColor[0]) * 0.5, (color[1] + pixelColor[1]) * 0.5, (color[2] + pixelColor[2]) * 0.5];

      var idx = (fx + fy * width) * 4;
      output[idx + 0] += pixelColor[0];
      output[idx + 1] += pixelColor[1];
      output[idx + 2] += pixelColor[2];
      output[idx + 3] += 1;
    }
  }
};

var estimateFlameDomain = exports.estimateFlameDomain = function estimateFlameDomain(transforms, randomInt) {
  var initialPointPicker = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _utils.randomComplex;
  var finalTransform = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _utils.IdentityFunc;
  var nbIterations = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 10000;

  var xmin = _maxSafeInteger2.default;
  var xmax = _minSafeInteger2.default;
  var ymin = _maxSafeInteger2.default;
  var ymax = _minSafeInteger2.default;

  var z = initialPointPicker();
  for (var i = 0; i < nbIterations; i++) {
    var transform = transforms[randomInt()];

    z = transform(z);
    var fz = finalTransform(z);

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
  return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
};

var enforceRGBA = exports.enforceRGBA = function enforceRGBA(buffer) {
  var newBuffer = new Uint8Array(buffer.length);
  buffer.forEach(function (x, i) {
    if ((i + 1) % 4 === 0) {
      newBuffer[i] = 255;
    } else {
      newBuffer[i] = (0, _utils.clampInt)(x * 255, 0, 255);
    }
  });
  return newBuffer;
};

var DISPLAY_LUMINANCE_MAX = 200;
var SCALEFACTOR_NUMERATOR = 1.219 + Math.pow(DISPLAY_LUMINANCE_MAX * 0.25, 0.4);
var applyContrastBasedScalefactor = exports.applyContrastBasedScalefactor = function applyContrastBasedScalefactor(buffer, width, height) {
  var luminanceMean = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  var gamma = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.45;

  // log-average luminance, as described in 'Photographic Tone Reproduction for Digital Images'
  // http://www.cmap.polytechnique.fr/~peyre/cours/x2005signal/hdr_photographic.pdf
  var logSum = 0;
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      var idx = (i + j * width) * 4;
      var luminance = getLuminance(buffer[idx], buffer[idx + 1], buffer[idx + 2]) / luminanceMean;
      logSum += Math.log(Math.max(luminance, 0.0001));
    }
  }

  var logAverage = Math.pow(10, logSum / (width * height));

  // scale factor, as described in 'A Contrast-Based Scalefactor for Luminance Display'
  // http://gaia.lbl.gov/btech/papers/35252.pdf
  var scalefactor = Math.pow(SCALEFACTOR_NUMERATOR / (1.219 + Math.pow(logAverage, 0.4)), 2.5) / DISPLAY_LUMINANCE_MAX;
  for (var _i = 0; _i < buffer.length; _i++) {
    if ((_i + 1) % 4 !== 0) {
      buffer[_i] = Math.max(buffer[_i] * scalefactor / luminanceMean, 0); // apply scalefactor
    }
  }

  applyGammaCorrection(buffer, gamma);
  return buffer;
};

var applyGammaCorrection = exports.applyGammaCorrection = function applyGammaCorrection(buffer) {
  var gamma = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.45;

  for (var i = 0; i < buffer.length; i++) {
    if ((i + 1) % 4 !== 0) {
      buffer[i] = Math.pow(buffer[i], gamma);
    }
  }
};

var getLuminance = exports.getLuminance = function getLuminance(r, g, b) {
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
};

var makeMixedColorSteal = exports.makeMixedColorSteal = function makeMixedColorSteal(colors, maxDistance, maxIterations) {
  var w1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.5;
  var w2 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.5;

  var colorFunc = colors;
  if (Array.isArray(colors)) {
    colorFunc = makeColorMapFunction(buildColorMap(colors), 255);
  }
  return function (re, im, p, n) {
    var distance = Math.sqrt(re * re + im * im) / maxDistance;
    return colorFunc(w1 * distance + w2 * (n / maxIterations));
  };
};

var buildColorMap = exports.buildColorMap = function buildColorMap(colors) {
  var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1024;

  var rgbColors = colors.map(function (color) {
    return D3Color.rgb.apply(D3Color, (0, _toConsumableArray3.default)(color));
  });
  var f = D3Interpolate.interpolateRgbBasis(rgbColors);
  var colormap = D3Interpolate.quantize(f, steps);
  return colormap.map(function (color) {
    var rgb = D3Color.rgb(color);
    return [rgb.r, rgb.g, rgb.b];
  });
};

var normalizeColorMap = exports.normalizeColorMap = function normalizeColorMap(colormap) {
  var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 255;

  return colormap.map(function (color) {
    return color.map(function (x) {
      return x / scale;
    });
  });
};

var pickColorMapValue = exports.pickColorMapValue = function pickColorMapValue(x, map) {
  var i = (0, _trunc2.default)((0, _utils.clamp)(x, 0, 1) * (map.length - 1));
  return map[i];
};

var makeColorMapFunction = exports.makeColorMapFunction = function makeColorMapFunction(map) {
  var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  if (scale != 1) {
    map = normalizeColorMap(map, scale);
  }
  return function (x) {
    return pickColorMapValue(x, map);
  };
};

var getAnalogousPalette = exports.getAnalogousPalette = function getAnalogousPalette(baseRgb, paletteSize) {
  var stepLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;

  var hsl = D3Color.hsl(D3Color.rgb.apply(D3Color, (0, _toConsumableArray3.default)(baseRgb)));
  return new Array(paletteSize).fill(0).map(function (_, i) {
    var offset = Math.ceil(i / 2) * stepLength;
    if (i % 2 === 1) {
      offset = -offset;
    }
    var newHue = (hsl.h + offset) % 360;
    var rgb = D3Color.hsl(newHue, hsl.s, hsl.l).rgb();
    return [Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b)];
  });
};