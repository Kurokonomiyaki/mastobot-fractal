'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeCircularBitmapTrap = exports.makeBitmapTrap = exports.JULIA_DOMAIN = exports.orbitTrapJulia = exports.computeJulia = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _complex = require('complex.js');

var _complex2 = _interopRequireDefault(_complex);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var computeJulia = exports.computeJulia = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(account, avatarUri, params) {
    var width = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1024;
    var height = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1024;

    var cx, cy, d, trapSize, trapType, avatar, trap, c, image, buffer, i, j, _mapPixelToDomain, _mapPixelToDomain2, x, y, color, idx, outputFile, outputPath;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cx = params.cx, cy = params.cy, d = params.d, trapSize = params.trapSize, trapType = params.trapType;
            _context.next = 3;
            return (0, _utils.readImage)(avatarUri);

          case 3:
            avatar = _context.sent;
            trap = null;

            if (trapType === 'circle') {
              trap = makeCircularBitmapTrap(avatar.bitmap.data, avatar.bitmap.width, avatar.bitmap.height, trapSize / 2, 0, 0);
            } else {
              trap = makeBitmapTrap(avatar.bitmap.data, avatar.bitmap.width, avatar.bitmap.height, trapSize, trapSize, 0, 0);
            }

            c = new _complex2.default(cx, cy);
            _context.next = 9;
            return (0, _utils.createImage)(width, height);

          case 9:
            image = _context.sent;
            buffer = image.bitmap.data;


            for (i = 0; i < width; i++) {
              for (j = 0; j < height; j++) {
                _mapPixelToDomain = (0, _utils.mapPixelToDomain)(i, j, width, height, JULIA_DOMAIN), _mapPixelToDomain2 = (0, _slicedToArray3.default)(_mapPixelToDomain, 2), x = _mapPixelToDomain2[0], y = _mapPixelToDomain2[1];
                color = orbitTrapJulia(new _complex2.default(x, y), c, trap, d, 100);
                idx = (i + j * width) * 4;

                buffer[idx + 0] = color[0];
                buffer[idx + 1] = color[1];
                buffer[idx + 2] = color[2];
                buffer[idx + 3] = 255;
              }
            }

            outputFile = (0, _md2.default)('' + account + new Date().getTime());
            outputPath = __dirname + '/../tmp/' + outputFile + '.png';

            (0, _utils.mkdirs)(_path2.default.dirname(outputPath));

            _context.next = 17;
            return (0, _utils.saveImage)(image, outputPath);

          case 17:
            return _context.abrupt('return', outputPath);

          case 18:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function computeJulia(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var orbitTrapJulia = exports.orbitTrapJulia = function orbitTrapJulia(z0, c, trap) {
  var d = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;
  var maxIterations = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 100;

  var zn = z0;
  var iterations = 0;
  var squaredMagnitude = zn.re * zn.re + zn.im * zn.im;
  while (squaredMagnitude <= 4 && iterations < maxIterations) {
    zn = zn.pow(d).add(c);

    if (trap.isTrapped(zn)) {
      return trap.interpolateTrap(zn);
    }

    squaredMagnitude = zn.re * zn.re + zn.im * zn.im;
    iterations++;
  }

  return trap.untrappedValue;
};

var JULIA_DOMAIN = exports.JULIA_DOMAIN = {
  xmin: -2,
  xmax: 2,
  ymin: -2,
  ymax: 2
};

var makeBitmapTrap = exports.makeBitmapTrap = function makeBitmapTrap(bitmap, bitmapWidth, bitmapHeight, trapWidth, trapHeight, x, y) {
  var xmin = x - trapWidth / 2;
  var xmax = x + trapWidth / 2;
  var ymin = y - trapHeight / 2;
  var ymax = y + trapHeight / 2;
  var isTrapped = function isTrapped(z) {
    return z.re >= xmin && z.re <= xmax && z.im >= ymin && z.im <= ymax;
  };

  var domain = { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
  var interpolateTrap = function interpolateTrap(z) {
    var _mapDomainToPixel = (0, _utils.mapDomainToPixel)(z.re, z.im, domain, bitmapWidth, bitmapHeight),
        _mapDomainToPixel2 = (0, _slicedToArray3.default)(_mapDomainToPixel, 2),
        bx = _mapDomainToPixel2[0],
        by = _mapDomainToPixel2[1];

    var idx = (bx + by * bitmapWidth) * 4;
    return bitmap.slice(idx, idx + 3);
  };

  return {
    isTrapped: isTrapped,
    interpolateTrap: interpolateTrap,
    untrappedValue: [0, 0, 0]
  };
};

var makeCircularBitmapTrap = exports.makeCircularBitmapTrap = function makeCircularBitmapTrap(bitmap, bitmapWidth, bitmapHeight, trapRadius, x, y) {
  var center = new _complex2.default(x, y);
  var isTrapped = function isTrapped(z) {
    return z.sub(center).abs() <= trapRadius;
  };

  var xmin = x - trapRadius;
  var xmax = x + trapRadius;
  var ymin = y - trapRadius;
  var ymax = y + trapRadius;
  var domain = { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
  var interpolateTrap = function interpolateTrap(z) {
    var _mapDomainToPixel3 = (0, _utils.mapDomainToPixel)(z.re, z.im, domain, bitmapWidth, bitmapHeight),
        _mapDomainToPixel4 = (0, _slicedToArray3.default)(_mapDomainToPixel3, 2),
        bx = _mapDomainToPixel4[0],
        by = _mapDomainToPixel4[1];

    var idx = (bx + by * bitmapWidth) * 4;
    return bitmap.slice(idx, idx + 3);
  };

  return {
    isTrapped: isTrapped,
    interpolateTrap: interpolateTrap,
    untrappedValue: [0, 0, 0]
  };
};