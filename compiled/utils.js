'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mkdirs = exports.saveImage = exports.readImage = exports.createImage = exports.getRandomParameters = exports.mapDomainToPixel = exports.mapPixelToDomain = undefined;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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