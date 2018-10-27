'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startBot = exports.publishImage = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _mastodonApi = require('mastodon-api');

var _mastodonApi2 = _interopRequireDefault(_mastodonApi);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _modules = require('./modules');

var ImageMakers = _interopRequireWildcard(_modules);

var _settings = require('./settings');

var _julia = require('./julia');

var _utils = require('./utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var enqueue = (0, _utils.makeQueue)();

var replyToToot = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, _ref3, instance, settings) {
    var id = _ref2.id;
    var acct = _ref3.acct,
        avatar_static = _ref3.avatar_static;
    var params, outputPath, response, mediaId, to, text;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // generate the image
            params = (0, _utils.getRandomParameters)(acct);
            _context.next = 3;
            return (0, _julia.computeJulia)(acct, avatar_static, params);

          case 3:
            outputPath = _context.sent;
            _context.next = 6;
            return instance.post('media', {
              file: _fs2.default.createReadStream(outputPath)
            });

          case 6:
            response = _context.sent;

            if (!(response.data == null || response.data.id == null)) {
              _context.next = 10;
              break;
            }

            console.warn('Error while uploading image', response.data || response, outputPath);
            return _context.abrupt('return');

          case 10:
            mediaId = response.data.id;

            // send the reply

            to = acct;

            if (to.startsWith('@') === false) {
              to = '@' + to;
            }
            text = to + ' Your personal julia set is: c=' + params.cx.toFixed(4) + '+' + params.cy.toFixed(4) + 'i, order ' + params.d + ', with a ' + params.trapType + ' trap';

            instance.post('statuses', (0, _assign2.default)({
              in_reply_to_id: id,
              status: text,
              media_ids: [mediaId]
            }, settings.tootOptions));

            _fs2.default.unlinkSync(outputPath); // delete the generated image

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function replyToToot(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

var onMessageReceived = function onMessageReceived(settings, instance, message) {
  var event = message.event,
      data = message.data;

  if (event === 'notification' && data.type === 'mention') {
    var toot = data.status;
    var author = data.account;

    if (toot.in_reply_to_id != null || toot.in_reply_to_account_id != null) {
      return;
    }

    console.log('Request received', author.acct);
    enqueue(function () {
      replyToToot(toot, author, instance, settings).then(function () {
        console.log('Reply sent', author.acct);
      }).catch(function (err) {
        console.warn('Error while replying to toot', toot.content, author.acct, err);
      });
    });
  }
};

var publishing = false;
var publishImage = exports.publishImage = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(instance, settings) {
    var maker, buffer, outputPath, response, mediaId;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(publishing === true)) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt('return');

          case 2:
            publishing = true;

            maker = ImageMakers[(0, _utils.pickRandom)((0, _keys2.default)(ImageMakers))];
            _context2.next = 6;
            return maker(2048, 2048);

          case 6:
            buffer = _context2.sent;
            outputPath = __dirname + '/../img/image-' + new Date().getTime() + '.png';

            (0, _utils.mkdirs)(_path2.default.dirname(outputPath));

            _context2.next = 11;
            return (0, _utils.saveImageBuffer)(buffer, 2048, 2048, outputPath);

          case 11:
            console.log('Generated', outputPath);

            // upload the generated image
            _context2.next = 14;
            return instance.post('media', {
              file: _fs2.default.createReadStream(outputPath)
            });

          case 14:
            response = _context2.sent;

            if (!(response.data == null || response.data.id == null)) {
              _context2.next = 18;
              break;
            }

            console.warn('Error while uploading generated image', response.data || response, outputPath);
            return _context2.abrupt('return');

          case 18:
            mediaId = response.data.id;

            // send the toot

            instance.post('statuses', (0, _assign2.default)({
              status: '(∩ ⚆ ᗜ ⚆ )⊃━✧.༸༓⁺ﾟ',
              media_ids: [mediaId]
            }, settings.tootOptions));

            publishing = false;

          case 21:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function publishImage(_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}();

var startBot = exports.startBot = function startBot() {
  var settings = (0, _settings.getSettings)(__dirname + '/../settings.json');

  var instance = new _mastodonApi2.default({
    access_token: settings.accessToken,
    api_url: settings.instanceUrl
  });

  var listener = instance.stream('streaming/user');
  listener.on('message', function (msg) {
    return onMessageReceived(settings, instance, msg);
  });
  listener.on('error', function (err) {
    return console.log(err);
  });
  // listener.on('heartbeat', msg => console.log('Dadoum.'));

  setInterval(function () {
    return publishImage(instance, settings);
  }, 4 * 60 * 60 * 1000);

  console.log('Listening...');
};