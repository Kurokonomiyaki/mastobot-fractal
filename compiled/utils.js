'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scaleDomain = exports.pickRandom = exports.randomRgbColor = exports.randomArray = exports.randomComplex = exports.randomInteger = exports.randomScalar = exports.clampInt = exports.clamp = exports.makeQueue = exports.makeQueuedFunction = exports.mkdirs = exports.saveImageBuffer = exports.saveImage = exports.readImage = exports.createImage = exports.getRandomParameters = exports.mapDomainToPixel = exports.mapPixelToDomain = exports.UNIT_DOMAIN = exports.BI_UNIT_DOMAIN = exports.IdentityFunc = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _trunc = require('babel-runtime/core-js/math/trunc');

var _trunc2 = _interopRequireDefault(_trunc);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _complex = require('complex.js');

var _complex2 = _interopRequireDefault(_complex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IdentityFunc = exports.IdentityFunc = function IdentityFunc(z) {
  return z;
};

var BI_UNIT_DOMAIN = exports.BI_UNIT_DOMAIN = { xmin: -1, xmax: 1, ymin: -1, ymax: 1 };
var UNIT_DOMAIN = exports.UNIT_DOMAIN = { xmin: 0, xmax: 1, ymin: 0, ymax: 1 };

var mapPixelToDomain = exports.mapPixelToDomain = function mapPixelToDomain(x, y, width, height, domain) {
  var domainWidth = domain.xmax - domain.xmin;
  var domainHeight = domain.ymax - domain.ymin;

  var xRatio = domainWidth / width;
  var yRatio = domainHeight / height;
  return [domain.xmin + x * xRatio, domain.ymin + y * yRatio];
};

var mapDomainToPixel = exports.mapDomainToPixel = function mapDomainToPixel(x, y, domain, width, height) {
  // optimization if domain is 0-1
  if (domain.xmin === 0 && domain.xmax === 1 && domain.ymin === 0 && domain.ymax === 1) {
    return [(0, _trunc2.default)(x * width), (0, _trunc2.default)(y * height)];
  }

  var domainWidth = domain.xmax - domain.xmin;
  var domainHeight = domain.ymax - domain.ymin;

  var xRatio = (width - 1) / domainWidth;
  var yRatio = (height - 1) / domainHeight;
  return [(0, _trunc2.default)((x - domain.xmin) * xRatio, width), (0, _trunc2.default)((y - domain.ymin) * yRatio, height)];
};

var getRandomParameters = exports.getRandomParameters = function getRandomParameters(str) {
  var hash = (0, _md2.default)(str);
  var cx = 1 - parseInt(hash.substring(0, 2), 16) / 127.5;
  var cy = 1 - parseInt(hash.substring(2, 4), 16) / 127.5;
  var d = 2 + Math.round(3 * parseInt(hash.substring(4, 6), 16) / 255);
  var trapSize = 0.75 + parseInt(hash.substring(6, 8), 16) / 510;

  var trapType = 'square';
  if (parseInt(hash.substring(6, 7), 16) % 2 === 1) {
    trapType = 'circle';
  }
  return { cx: cx, cy: cy, d: d, trapSize: trapSize, trapType: trapType };
};

var createImage = exports.createImage = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(width, height) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new _promise2.default(function (resolve, reject) {
              new _jimp2.default(width, height, function (err, image) {
                if (err) {
                  reject(err);
                } else {
                  resolve(image);
                }
              });
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function createImage(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var readImage = exports.readImage = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(path) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt('return', _jimp2.default.read(path));

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function readImage(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

var saveImage = exports.saveImage = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(image, path) {
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt('return', image.writeAsync(path));

          case 1:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function saveImage(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
}();

var saveImageBuffer = exports.saveImageBuffer = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(buffer, width, height, path) {
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt('return', new _promise2.default(function (resolve, reject) {
              new _jimp2.default({ data: buffer, width: width, height: height }, function (err, image) {
                if (err) {
                  reject(err);
                } else {
                  saveImage(image, path).then(function () {
                    return resolve(image);
                  }).catch(reject);
                }
              });
            }));

          case 1:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function saveImageBuffer(_x6, _x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}();

var mkdirs = exports.mkdirs = function mkdirs(dir) {
  var initDir = _path2.default.isAbsolute(dir) ? _path2.default.sep : '';
  dir.split(_path2.default.sep).reduce(function (parentDir, childDir) {
    var curDir = _path2.default.resolve(parentDir, childDir);
    if (_fs2.default.existsSync(curDir) === false) {
      _fs2.default.mkdirSync(curDir);
    }
    return curDir;
  }, initDir);
};

var makeQueuedFunction = exports.makeQueuedFunction = function makeQueuedFunction(f) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000;

  var lastTaken = 0;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var delta = Date.now() - lastTaken;
    if (delta > 0 && delta < delay) {
      lastTaken = Date.now() + delta;
      setTimeout(function () {
        return f.apply(undefined, args);
      }, delta);
    } else if (delta < 0) {
      lastTaken += delay;
      setTimeout(function () {
        return f.apply(undefined, args);
      }, Math.abs(delta));
    } else {
      lastTaken = Date.now();
      f.apply(undefined, args);
    }
  };
};

var makeQueue = exports.makeQueue = function makeQueue() {
  var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10000;

  return makeQueuedFunction(function (f) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    return f.apply(undefined, args);
  }, delay);
};

var clamp = exports.clamp = function clamp(x, min, max) {
  return Math.max(min, Math.min(x, max));
};

var clampInt = exports.clampInt = function clampInt(x, min, max) {
  return (0, _trunc2.default)(clamp(x, min, max));
};

var randomScalar = exports.randomScalar = function randomScalar() {
  var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
  var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  return Math.random() * (max - min) + min;
};
var randomInteger = exports.randomInteger = function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
};
var randomComplex = exports.randomComplex = function randomComplex() {
  var reMin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
  var reMax = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var imMin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
  var imMax = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

  return new _complex2.default(randomScalar(reMin, reMax), randomScalar(imMin, imMax));
};
var randomArray = exports.randomArray = function randomArray(size) {
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var arr = new Array(size);
  for (var i = 0; i < size; i++) {
    arr[i] = randomScalar(min, max);
  }
  return arr;
};
var randomRgbColor = exports.randomRgbColor = function randomRgbColor() {
  return randomArray(3, 0, 255);
};
var pickRandom = exports.pickRandom = function pickRandom(arr) {
  return arr[(0, _trunc2.default)(Math.random() * arr.length)];
};

var scaleDomain = exports.scaleDomain = function scaleDomain(domain) {
  var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  return {
    xmin: domain.xmin * scale,
    ymin: domain.ymin * scale,
    xmax: domain.xmax * scale,
    ymax: domain.ymax * scale
  };
};