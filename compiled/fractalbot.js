'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startBot = undefined;

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

var _settings = require('./settings');

var _julia = require('./julia');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

            // delete the generated image
            _fs2.default.unlinkSync(outputPath);

          case 13:
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
    replyToToot(toot, author, instance, settings).then(function () {
      console.log('Reply sent', author.acct);
    }).catch(function (err) {
      console.log('Error while replying to toot', toot.content, author.acct, err);
    });
  }
};

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

  console.log('Listening...');
};