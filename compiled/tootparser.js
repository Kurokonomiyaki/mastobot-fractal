'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseToot = undefined;

var _htmlparser = require('htmlparser');

var _htmlparser2 = _interopRequireDefault(_htmlparser);

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var domNodeToText = function domNodeToText(node) {
  var text = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var name = node.name,
      type = node.type,
      _node$attribs = node.attribs,
      attribs = _node$attribs === undefined ? {} : _node$attribs,
      children = node.children;
  var className = attribs.class;

  // regular text

  if (type === 'text') {
    text.push(node.data);
    return;
  }
  // ignore invisible content (cw)
  if (className != null && className.includes('invisible')) {
    return;
  }
  // ignore url
  if (name === 'a') {
    return;
  }
  // analyze children
  if (children != null && children.length > 0) {
    children.forEach(function (child) {
      domNodeToText(child, text);
    });
  }
};

var analyzeTootDom = function analyzeTootDom(dom) {
  var texts = [];
  if (dom.length > 0) {
    dom.forEach(function (child) {
      domNodeToText(child, texts);
    });
  }

  if (texts.length === 0) {
    return null;
  }

  return _he2.default.decode(texts.join(' '));
};

var parseToot = exports.parseToot = function parseToot(toot, onResult) {
  var handler = new _htmlparser2.default.DefaultHandler(function (error, dom) {
    if (error != null) {
      console.log('Parse error', error);
      return;
    }
    onResult(analyzeTootDom(dom));
  });

  var parser = new _htmlparser2.default.Parser(handler);
  parser.parseComplete(toot);
};

exports.default = parseToot;