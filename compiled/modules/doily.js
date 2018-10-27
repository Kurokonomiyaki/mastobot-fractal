'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _sign = require('babel-runtime/core-js/math/sign');

var _sign2 = _interopRequireDefault(_sign);

var _complex = require('complex.js');

var _complex2 = _interopRequireDefault(_complex);

var _plot = require('../plot');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeHopalong = function makeHopalong(a, b, c) {
  return function (z) {
    return new _complex2.default(z.im - (0, _sign2.default)(z.re) * Math.sqrt(Math.abs(b * z.re - c)), a - z.re);
  };
};

var run = exports.run = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(width, height) {
    var nbIterations, domain, _loop, _ret;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            nbIterations = 100000000;
            domain = { xmin: 0, xmax: 0, ymin: 0, ymax: 0 };

            _loop = function _loop() {
              var a = (0, _utils.randomScalar)(-5, 5);
              var b = (0, _utils.randomScalar)(-5, 5);
              var c = (0, _utils.randomScalar)(-5, 5);
              var f = makeHopalong(a, b, c);

              var finalTransform = function finalTransform(z) {
                return z;
              };
              var initalPoint = (0, _utils.randomComplex)();
              var initialPointPicker = function initialPointPicker() {
                return initalPoint;
              };

              domain = (0, _plot.estimateAttractorDomain)(f, initialPointPicker, finalTransform, nbIterations);

              if (Math.abs(domain.xmax - domain.xmin) > 50 && Math.abs(domain.ymax - domain.ymin) > 50) {
                domain = (0, _utils.scaleDomain)(domain, (0, _utils.randomScalar)(0.5, 0.85));

                var palette = (0, _plot.getAnalogousPalette)((0, _utils.randomArray)(3, 50, 200), (0, _utils.randomInteger)(2, 6));
                var colorFunc = (0, _plot.makeMixedColorSteal)(palette, domain.xmax, nbIterations);

                console.log('Doily generator', a, b, c, initalPoint, domain);
                var buffer = new Float64Array(width * height * 4);
                (0, _plot.plotAttractorWithColorStealing)(buffer, width, height, f, colorFunc, false, initialPointPicker, finalTransform, nbIterations, domain);

                var averageHits = Math.max(1, nbIterations / (width * height));
                (0, _plot.applyContrastBasedScalefactor)(buffer, width, height, averageHits);

                return {
                  v: (0, _plot.enforceRGBA)(buffer)
                };
              }
            };

          case 3:
            if (!true) {
              _context.next = 9;
              break;
            }

            _ret = _loop();

            if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
              _context.next = 7;
              break;
            }

            return _context.abrupt('return', _ret.v);

          case 7:
            _context.next = 3;
            break;

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function run(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();